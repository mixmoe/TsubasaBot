import { Context } from "koishi";
import * as bilibili from "./bilibili";
import * as netease from "./netease";
import * as network from "./network";
import * as pixiv from "./pixiv";

export function apply(ctx: Context) {
  ctx.plugin(network).plugin(pixiv).plugin(bilibili).plugin(netease);
}
