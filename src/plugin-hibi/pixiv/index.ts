import { Context, segment, template } from "koishi";
import * as _ from "lodash";
import {
  BoundedNumber,
  datetime,
  EnumerateType,
  ForwardMessageBuilder,
} from "../utils";
import * as constants from "./constants";
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
} from "./utils";

const imageSendLimit = BoundedNumber({ le: 5, ge: 1 });

function ranking(ctx: Context) {
  ctx
    .command(constants.COMMAND_RANKING, {})
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
      await session?.send(template(constants.TEMPLATE_START_PROMPT));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const inputDate = datetime(options?.date),
        maximumDate = datetime().subtract(2, "day");
      const response = await pixiv.rank({
        mode: options?.type,
        date: (inputDate.isValid() && inputDate.isBefore(maximumDate)
          ? inputDate
          : maximumDate
        ).format("YYYY-MM-DD"),
      });
      const illust = _.sample(
        response.illusts.filter(({ type }) =>
          options?.illustType ? type === options.illustType : true,
        ),
      );
      if (!illust) return template(constants.TEMPLATE_NOT_FOUND);

      forward.add(
        template(constants.TEMPLATE_ILLUST, {
          title: illust.title,
          illustId: illust.id,
          member: illust.user.name,
          memberId: illust.user.id,
          total: illust.page_count,
          send: options?.limit,
        }),
      );

      forward.add(
        ...(await buildSingleIllustMessages(illust, options?.limit!)),
      );

      await forward.send();
    });
}

function illust(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_ILLUST} <id:posint>`)
    .alias("点图", "p站点图", "pixiv点图")
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 5,
    })
    .action(async ({ options, session }, id) => {
      await session?.send(template(constants.TEMPLATE_START_PROMPT));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const { illust } = await pixiv.illust({ id });

      forward.add(
        template(constants.TEMPLATE_ILLUST, {
          title: illust.title,
          illustId: illust.id,
          member: illust.user.name,
          memberId: illust.user.id,
          total: illust.page_count,
          send: options?.limit,
        }),
      );

      forward.add(
        ...(await buildSingleIllustMessages(illust, options?.limit!)),
      );

      await forward.send();
    });
}

function member(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_MEMBER} <id:posint>`)
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
      await session?.send(template(constants.TEMPLATE_START_PROMPT));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const memberData = await pixiv.member({ id });
      const { illusts } = await pixiv.memberIllust({
        id,
        page: options?.page,
        type: options?.illustType,
      });

      forward.add(
        template(constants.TEMPLATE_MEMBER, {
          avatar: segment.image(
            mirrorPixivImage(memberData.user.profile_image_urls.medium),
          ),
          member: memberData.user.name,
          memberId: memberData.user.id,
          illusts: memberData.profile.total_illusts,
          bookmarks: memberData.profile.total_illust_bookmarks_public,
          total: illusts.length,
          send: options?.limit,
        }),
      );

      forward.add(
        ...(await buildMultiIllustMessages(illusts, options?.limit!)),
      );

      await forward.send();
    });
}

function search(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_SEARCH} <keyword:string>`)
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
      await session?.send(template(constants.TEMPLATE_START_PROMPT));
      const { username: name, userId: uin } = session!;
      const forward = new ForwardMessageBuilder(name, +uin!);

      const { illusts } = await pixiv.illustSearch({
        word: keyword,
        page: options?.page,
        mode: options?.type,
        order: options?.order,
        duration: options?.duration,
      });

      forward.add(
        template(constants.TEMPLATE_SEARCH, {
          keyword,
          page: options?.page,
          total: illusts.length,
          send: options?.limit,
        }),
      );

      forward.add(
        ...(await buildMultiIllustMessages(illusts, options?.limit!)),
      );

      await forward.send();
    });
}

export function apply(ctx: Context) {
  ctx.plugin(ranking).plugin(illust).plugin(member).plugin(search);
}
