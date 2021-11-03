import { Context } from "koishi";
import * as bilibili from "./bilibili";
import * as netease from "./netease";
import * as network from "./network";
import * as pixiv from "./pixiv";
import { EventLocal, storage } from "./utils";

function local(ctx: Context) {
  ctx.middleware(
    (session, next) => storage.run(new EventLocal(session), next),
    true,
  );
}

export function apply(ctx: Context) {
  ctx
    .plugin(local)
    .plugin(network)
    .plugin(pixiv)
    .plugin(bilibili)
    .plugin(netease);
}
