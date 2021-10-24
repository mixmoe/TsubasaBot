import { Context } from "koishi";

export default function apply(ctx: Context) {
  ctx.middleware(async (session, next) => {
    if (session.content?.includes("koishi")) {
      await session.send("koishi");
    }
    return next();
  });
}
