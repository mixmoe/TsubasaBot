import { Context } from "koishi";
import * as pixiv from "./pixiv";

export function apply(ctx: Context) {
  ctx.plugin(pixiv);
}
