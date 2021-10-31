import { Context } from "koishi";
import { matchVideoId } from "./utils";

export function apply(ctx: Context) {
  ctx.middleware(async (session, next) => {
    const aid = await matchVideoId(session.content || "");
    return aid ? session.execute(`${command.name} ${aid}`, next) : next();
  });
  const command = ctx
    .command("hibi/bilibili.video <aid:number>", { minInterval: 30 })
    .action(({ session }, aid) => session?.send(String(aid)));
}
