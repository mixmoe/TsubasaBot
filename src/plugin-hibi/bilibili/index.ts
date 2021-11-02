import * as dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import * as dayjsDuration from "dayjs/plugin/duration";
import * as dayjsLocalizedFormat from "dayjs/plugin/localizedFormat";
import * as dayjsRelativeTime from "dayjs/plugin/relativeTime";
import { Context, segment, template } from "koishi";
import { ForwardMessageBuilder, src2image } from "../utils";
import * as constants from "./constants";
import * as bilibili from "./network";
import { matchVideoId } from "./utils";

dayjs.extend(dayjsDuration);
dayjs.extend(dayjsRelativeTime);
dayjs.extend(dayjsLocalizedFormat);
dayjs.locale("zh-cn");

function video(ctx: Context) {
  ctx.middleware(async (session, next) => {
    if (!session.content?.trim()) return next();
    const aid = await matchVideoId(session.content);
    return aid ? session.execute(`${command.name} ${aid} -q`, next) : next();
  });
  const command = ctx
    .command(`${constants.COMMAND_VIDEO} <aid:number>`, {
      minInterval: 15 * 1000,
      checkArgCount: true,
    })
    .option("quiet", "-q 不显示发送提示", { hidden: true, fallback: false })
    .action(async ({ options, session }, aid) => {
      const { username: name, userId: uin } = session!;

      if (options?.quiet)
        await session?.send(template(constants.TEMPLATE_START_PROMPT));

      const response = await bilibili.video({ aid }),
        forward = new ForwardMessageBuilder(name, +uin!);

      forward.add(src2image(response.pic));
      forward.add(
        template(constants.TEMPLATE_VIDEO, {
          title: response.title,
          uploader: response.owner.name,
          uploaderId: response.owner.mid,
          duration: dayjs.duration(response.duration * 1000).humanize(),
          relativeDuration: dayjs
            .duration(dayjs(response.pubdate * 1000).diff())
            .humanize(true),
          published: dayjs(response.pubdate * 1000).format("llll"),
          bvid: response.bvid,
          aid: response.aid,
          view: response.stat.view,
          danmaku: response.stat.danmaku,
          reply: response.stat.reply,
          favorite: response.stat.favorite,
          coin: response.stat.coin,
          share: response.stat.share,
          like: response.stat.like,
        }),
      );
      forward.add(
        segment("share", {
          url: response.short_link,
          title: response.title,
          content: response.desc,
          image: response.pic,
        }),
      );

      await forward.send(session!);
    });
}

export function apply(ctx: Context) {
  ctx.plugin(video);
}
