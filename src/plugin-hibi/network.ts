import axios from "axios";
import * as AxiosLogger from "axios-logger";
import { Context } from "koishi";

export const hibi = axios.create({
  baseURL: "https://api.obfs.dev/api/",
  headers: { "User-Agent": "TsubasaBot (koishi-plugin-hibi)" },
});

export function apply(ctx: Context) {
  const logger = ctx.logger("hibi.network");
  hibi.interceptors.request.use(
    (request) =>
      AxiosLogger.requestLogger(request, {
        logger: logger.debug.bind(this),
        data: false,
        prefixText: false,
      }),
    (error) =>
      AxiosLogger.errorLogger(error, {
        logger: logger.error.bind(this),
        data: false,
        prefixText: false,
      })
  );
  hibi.interceptors.response.use(
    (response) =>
      AxiosLogger.responseLogger(response, {
        logger: logger.debug.bind(this),
        data: false,
        prefixText: false,
      }),
    (error) =>
      AxiosLogger.errorLogger(error, {
        logger: logger.error.bind(this),
        data: false,
        prefixText: false,
      })
  );
}