import * as dayjs from "dayjs";
import { Context, template } from "koishi";
import {
  BoundedNumber,
  EnumerateType,
  ForwardMessageBuilder,
  src2segment,
} from "../utils";
import {
  PixivIllustType,
  PixivRankType,
  PixivSearchDurationType,
  PixivSearchOrderType,
  PixivSearchType,
} from "./models";
import * as pixiv from "./network";
import {
  buildMultiIllustMessages,
  buildSingleIllustMessages,
  mirrorPixivImage,
  randomChoice,
} from "./utils";

const imageSendLimit = BoundedNumber({ le: 5, ge: 1 });

template.set("hibi.pixiv", {
  startPrompt: `开始获取图片信息`,
  notFound: `没有找到相关图片`,
  pageCount: `第{0}张`,
  imageSent: `{{desc}}\n{{image}}`,
  illust: `
标题: {{title}} (ID: {{illustId}})
作者: {{member}} (ID: {{memberId}})

该作品共有 {{total}} 张图片, 将会发送前 {{send}} 张`.trim(),
  member: `
{{avatar}}
作者: {{member}} (ID: {{memberId}})
共 {{illusts}} 份插画, 共获得了 {{bookmarks}} 个收藏

本页共有 {{total}} 张图片, 将会发送本页人气最高的前 {{send}} 张`.trim(),
  search: `
关于 {{keyword}} 的 Pixiv 搜索结果第 {{page}} 页

共搜索到 {{total}} 条结果, 将会发送本页人气最高的前 {{send}} 张`.trim(),
});

function ranking(ctx: Context) {
  ctx
    .command("hibi/pixiv.ranking", {})
    .alias("一图")
    .option("type", "-t <type> 排行榜类型", {
      type: EnumerateType(PixivRankType),
      fallback: undefined,
    })
    .option("date", "-d <date:date> 排行榜日期, 格式yyyy-mm-dd", {
      fallback: null,
    })
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 5,
    })
    .option("illustType", "-i <type> 画作类型", {
      type: EnumerateType(PixivIllustType),
      fallback: undefined,
    })
    .action(async ({ options, session }) => {
      await session?.send(template("hibi.pixiv.startPrompt"));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const inputDate = dayjs(options?.date),
        maximumDate = dayjs().subtract(2, "day");
      const response = await pixiv.rank({
        mode: options?.type,
        date: (inputDate.isValid() && inputDate.isBefore(maximumDate)
          ? inputDate
          : maximumDate
        ).format("YYYY-MM-DD"),
      });
      const illust = randomChoice(
        response.illusts.filter(({ type }) =>
          options?.illustType ? type === options.illustType : true
        )
      );
      if (!illust) return template("hibi.pixiv.notFound");

      forward.add(
        template("hibi.pixiv.illust", {
          title: illust.title,
          illustId: illust.id,
          member: illust.user.name,
          memberId: illust.user.id,
          total: illust.page_count,
          send: options?.limit,
        })
      );

      forward.add(
        ...(await buildSingleIllustMessages(illust, options?.limit!))
      );

      await forward.send(session!);
    });
}

function illust(ctx: Context) {
  ctx
    .command("hibi/pixiv.illust <id:posint>")
    .alias("点图", "p站点图", "pixiv点图")
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 5,
    })
    .action(async ({ options, session }, id) => {
      await session?.send(template("hibi.pixiv.startPrompt"));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const { illust } = await pixiv.illust({ id });

      forward.add(
        template("hibi.pixiv.illust", {
          title: illust.title,
          illustId: illust.id,
          member: illust.user.name,
          memberId: illust.user.id,
          total: illust.page_count,
          send: options?.limit,
        })
      );

      forward.add(
        ...(await buildSingleIllustMessages(illust, options?.limit!))
      );

      await forward.send(session!);
    });
}

function member(ctx: Context) {
  ctx
    .command("hibi/pixiv.member <id:posint>")
    .alias("p站用户", "p站用户信息", "画师")
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 5,
    })
    .option("page", "-p <page:posint> 页数", { fallback: 1 })
    .option("illustType", "-i <type> 画作类型", {
      type: EnumerateType(PixivIllustType),
      fallback: undefined,
    })
    .action(async ({ options, session }, id) => {
      await session?.send(template("hibi.pixiv.startPrompt"));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const memberData = await pixiv.member({ id });
      let { illusts } = await pixiv.memberIllust({
        id,
        page: options?.page,
        type: options?.illustType,
      });

      forward.add(
        template("hibi.pixiv.member", {
          avatar: src2segment(
            mirrorPixivImage(memberData.user.profile_image_urls.medium)
          ),
          member: memberData.user.name,
          memberId: memberData.user.id,
          illusts: memberData.profile.total_illusts,
          bookmarks: memberData.profile.total_illust_bookmarks_public,
          total: illusts.length,
          send: options?.limit,
        })
      );

      forward.add(
        ...(await buildMultiIllustMessages(illusts, options?.limit!))
      );

      await forward.send(session!);
    });
}

function search(ctx: Context) {
  ctx
    .command("hibi/pixiv.search <keyword:string>")
    .alias("p站搜图", "pixiv搜图")
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 5,
    })
    .option("page", "-p <page:posint> 页数", { fallback: 1 })
    .option("type", "-t <type> 搜索类型", {
      type: EnumerateType(PixivSearchType),
      fallback: undefined,
    })
    .option("order", "-o <order> 结果顺序", {
      type: EnumerateType(PixivSearchOrderType),
      fallback: undefined,
    })
    .option("duration", "-d <duration> 搜索时间区间", {
      type: EnumerateType(PixivSearchDurationType),
      fallback: undefined,
    })
    .action(async ({ options, session }, keyword) => {
      await session?.send(template("hibi.pixiv.startPrompt"));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      let { illusts } = await pixiv.illustSearch({
        word: keyword,
        page: options?.page,
        mode: options?.type,
        order: options?.order,
        duration: options?.duration,
      });
      await session?.send(
        template("hibi.pixiv.search", {
          keyword,
          page: options?.page,
          total: illusts.length,
          send: options?.limit,
        })
      );

      forward.add(
        ...(await buildMultiIllustMessages(illusts, options?.limit!))
      );

      await forward.send(session!);
    });
}

export function apply(ctx: Context) {
  ctx.plugin(ranking).plugin(illust).plugin(member).plugin(search);
}
