import axios from "axios";
import * as AxiosLogger from "axios-logger";
import { Context } from "koishi";

export const hibi = axios.create({
  baseURL: "https://api.obfs.dev/api/",
  headers: { "User-Agent": "TsubasaBot (koishi-plugin-hibi)" },
  validateStatus: (status) => status < 400,
});

export function apply(ctx: Context) {
  const logger = ctx.logger("hibi.network");
  const commonConfig = { data: false, prefixText: false },
    errorConfig = { ...commonConfig, logger: logger.error },
    debugConfig = { ...commonConfig, logger: logger.debug };
  hibi.interceptors.request.use(
    (request) => AxiosLogger.requestLogger(request, debugConfig),
    (error) => AxiosLogger.errorLogger(error, errorConfig),
  );
  hibi.interceptors.response.use(
    (response) => AxiosLogger.responseLogger(response, debugConfig),
    (error) => AxiosLogger.errorLogger(error, errorConfig),
  );
}
