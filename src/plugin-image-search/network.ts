import axios from "axios";
import * as AxiosLogger from "axios-logger";
import { Context } from "koishi";

export const request = axios.create({
  headers: { "User-Agent": "TsubasaBot (koishi-plugin-image-search)" },
  validateStatus: (status) => status < 400,
});

export function apply(ctx: Context) {
  const logger = ctx.logger("image-search.network");
  const commonConfig = { data: false, prefixText: false },
    errorConfig = { ...commonConfig, logger: logger.error },
    debugConfig = { ...commonConfig, logger: logger.debug };
  request.interceptors.request.use(
    (request) => AxiosLogger.requestLogger(request, debugConfig),
    (error) => AxiosLogger.errorLogger(error, errorConfig),
  );
  request.interceptors.response.use(
    (response) => AxiosLogger.responseLogger(response, debugConfig),
    (error) => AxiosLogger.errorLogger(error, errorConfig),
  );
}
