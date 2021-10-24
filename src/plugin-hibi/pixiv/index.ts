import { Context, Command, segment } from "koishi";
import { BoundedNumber, EnumerateType, randomChoice } from "../utils";
import { proxyPixivImage } from "./network";
import * as pixiv from "./network";
import { PixivRankType } from "./models";
import * as dayjs from "dayjs";

function ranking(command: Command) {
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
      const inputDate = dayjs(options?.date),
        maximumDate = dayjs().subtract(2, "day");
      const response = await pixiv.rank({
        mode: options?.type,
        date: (inputDate.isValid() && inputDate.isBefore(maximumDate)
          ? inputDate
          : maximumDate
        ).format("YYYY-MM-DD"),
      });
      const illust = randomChoice(response.illusts);
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

export function apply(ctx: Context) {
  const command = ctx.command("hibi/pixiv");
  ranking(command);
}
