import { Context, Command, segment, template } from "koishi";
import {
  BoundedNumber,
  cardImageSegment,
  EnumerateType,
  imageSegment,
  randomChoice,
} from "../utils";
import { proxyPixivImage } from "./network";
import * as pixiv from "./network";
import { PixivIllustType, PixivRankType } from "./models";
import * as dayjs from "dayjs";

const imageSendLimit = BoundedNumber({ le: 3, ge: 1 });

template.set("hibi.pixiv", {
  startPrompt: `开始获取图片信息`,
  notFound: `没有找到相关图片`,
  pageCount: `第{0}张`,
  sourceShow: `ID: {0}`,
  illust: `
标题: {{title}} (ID: {{illustId}})
作者: {{member}} (ID: {{memberId}})

该作品共有 {{total}} 张图片, 将会发送前 {{send}} 张
`.trim(),
  member: `
{{avatar}}
作者: {{member}} (ID: {{memberId}})
共 {{illusts}} 份插画, 共获得了 {{bookmarks}} 个收藏

本页共有 {{total}} 张图片, 将会发送本页人气最高的前 {{send}} 张
`.trim(),
});

function ranking(command: Command) {
  command
    .subcommand("pixiv.ranking")
    .alias("一图")
    .option("type", "-t <type> 排行榜类型", {
      type: EnumerateType(PixivRankType),
      fallback: PixivRankType[PixivRankType.week],
    })
    .option("date", "-d <date:date> 排行榜日期, 格式yyyy-mm-dd", {
      fallback: null,
    })
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 3,
    })
    .option("illustType", "-i <type> 画作类型", {
      type: EnumerateType(PixivIllustType),
      fallback: undefined,
    })
    .action(async ({ options, session }) => {
      await session?.send(template("hibi.pixiv.startPrompt"));

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

      await session?.send(
        template("hibi.pixiv.illust", {
          title: illust.title,
          illustId: illust.id,
          member: illust.user.name,
          memberId: illust.user.id,
          total: illust.page_count,
          send: options?.limit,
        })
      );

      const images = (
        !illust.meta_single_page.original_image_url
          ? illust.meta_pages.map(({ image_urls }) => image_urls.original)
          : [illust.meta_single_page.original_image_url]
      )
        .map(proxyPixivImage)
        .slice(0, options?.limit);

      for (let index = 0; index < images.length; index++) {
        await session?.send(
          cardImageSegment({
            file: images[index],
            source: template("hibi.pixiv.pageCount", index + 1),
          })
        );
      }
    });
}

function illust(command: Command) {
  command
    .subcommand("pixiv.illust <id:posint>")
    .alias("点图", "p站点图", "pixiv点图")
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 3,
    })
    .action(async ({ options, session }, id) => {
      await session?.send(template("hibi.pixiv.startPrompt"));

      const { illust } = await pixiv.illust({ id });

      await session?.send(
        template("hibi.pixiv.illust", {
          title: illust.title,
          illustId: illust.id,
          member: illust.user.name,
          memberId: illust.user.id,
          total: illust.page_count,
          send: options?.limit,
        })
      );

      const images = (
        !illust.meta_single_page.original_image_url
          ? illust.meta_pages.map(({ image_urls }) => image_urls.original)
          : [illust.meta_single_page.original_image_url]
      )
        .map(proxyPixivImage)
        .slice(0, options?.limit);

      for (let index = 0; index < images.length; index++) {
        await session?.send(
          segment("cardimage", {
            file: images[index],
            source: template("hibi.pixiv.pageCount", index + 1),
          })
        );
      }
    });
}

function member(command: Command) {
  command
    .subcommand("pixiv.member <id:posint>")
    .alias("p站用户", "p站用户信息", "画师")
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: imageSendLimit,
      fallback: 3,
    })
    .option("page", "-p <page:posint> 页数", { fallback: 1 })
    .option("illustType", "-i <type> 画作类型", {
      type: EnumerateType(PixivIllustType),
      fallback: undefined,
    })
    .action(async ({ options, session }, id) => {
      await session?.send(template("hibi.pixiv.startPrompt"));

      const memberData = await pixiv.member({ id });
      let { illusts } = await pixiv.memberIllust({
        id,
        page: options?.page,
        type: options?.illustType,
      });
      await session?.send(
        template("hibi.pixiv.member", {
          avatar: imageSegment({
            file: proxyPixivImage(memberData.user.profile_image_urls.medium),
          }),
          member: memberData.user.name,
          memberId: memberData.user.id,
          illusts: memberData.profile.total_illusts,
          bookmarks: memberData.profile.total_illust_bookmarks_public,
          total: illusts.length,
          send: options?.limit,
        })
      );

      illusts = illusts
        .sort(
          (a, b) =>
            a.total_bookmarks / a.total_view - b.total_bookmarks / b.total_view
        )
        .reverse()
        .slice(0, options?.limit);
      for (const illust of illusts) {
        await session?.send(
          cardImageSegment({
            file: proxyPixivImage(illust.image_urls.large),
            source: template("hibi.pixiv.sourceShow", illust.id),
          })
        );
      }
    });
}

export function apply(ctx: Context) {
  const command = ctx.command("hibi");
  ranking(command);
  illust(command);
  member(command);
}
