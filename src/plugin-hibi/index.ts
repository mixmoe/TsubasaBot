import * as dayjs from "dayjs";
import { Context, segment } from "koishi";
import { PixivRankType } from "./models";
import {
  BoundedNumber,
  EnumerateType,
  proxyPixivImage,
  randomChoice,
} from "./utils";
import { pixiv } from "./network";

export function apply(ctx: Context) {
  const command = ctx.command("hibi");
  command
    .subcommand("pixiv.search <keyword:text>")
    .alias("p站搜图", "P站搜图", "Pixiv搜图", "pixiv搜图")
    .option("limit", "-l <size:posint>", { fallback: 3 })
    .option("page", "-p <page:number>", { fallback: 1 })
    .action(({ options }, keyword) => "");
  command
    .subcommand("pixiv.illust <pid:number>")
    .option("limit", "-l <size:number>", { fallback: 3 })
    .action(({ options }, pid) => "");
  command
    .subcommand("pixiv.user <uid:number>")
    .option("limit", "-l <size:number>", { fallback: 3 })
    .action(({ options }, uid) => "");
  command
    .subcommand("pixiv.ranking")
    .alias("一图")
    .option("type", "-t <type> 排行榜类型", {
      type: EnumerateType(PixivRankType),
      fallback: PixivRankType.week,
    })
    .option("date", "-d <date:date> 排行榜日期, 格式yyyy-mm-dd", {
      fallback: null,
    })
    .option("limit", "-l <size:number> 最多发送图片数量", {
      type: BoundedNumber({ le: 3, ge: 1 }),
      fallback: 3,
    })
    .action(async ({ options, session }) => {
      const date = (
        options?.date ? dayjs(options.date) : dayjs().subtract(2, "day")
      ).format("YYYY-MM-DD");
      const illust = randomChoice(
        await pixiv.ranking({ mode: options?.type, date })
      );
      if (!illust) return "没有找到相关图片";

      await session?.send(
        segment("share", {
          title: illust.title,
          content: illust.user.name,
          url: `https://pixiv.obfs.dev/#/artwork/${illust.id}`,
          image: proxyPixivImage(illust.image_urls.square_medium),
        })
      );

      const images = (
        !illust.meta_single_page.original_image_url
          ? illust.meta_pages.map((page) => page.image_urls.original)
          : [illust.meta_single_page.original_image_url]
      )
        .map(proxyPixivImage)
        .slice(0, options?.limit);
      for (let index = 0; index < images.length; index++) {
        await session?.send(
          segment("cardimage", {
            file: images[index],
            source: `第${index + 1}张`,
          })
        );
      }
    });
}
