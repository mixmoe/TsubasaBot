import { Context, Argv, template, segment } from "koishi";
import axios from "axios";
import * as dayjs from "dayjs";

enum PixivRankType {
  day,
  week,
  month,
  day_male,
  day_female,
  week_original,
  week_rookie,
}

const hibi = axios.create({
  baseURL: "https://api.obfs.dev/api/",
  headers: { "user-agent": "TsubasaBot" },
});

const proxyImage = (source: string): string => {
  const url = new URL(source);
  url.host = "pximg.obfs.dev";
  return url.href;
};

const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

declare module "koishi" {
  namespace Argv {
    interface Domain {
      pixiv_rank: PixivRankType;
    }
  }
}

interface PixivIllust {
  id: number;
  title: string;
  type: "illust" | "manga";
  image_urls: {
    square_medium: string;
    medium: string;
    large: string;
  };
  caption: string;
  restrict: number;
  user: {
    id: number;
    name: string;
    account: string;
    profile_image_urls: {
      medium: string;
    };
  };
  tags: {
    name: string;
    translated_name: string;
  }[];
  tools: string[];
  create_date: string;
  page_count: number;
  width: number;
  height: number;
  sanity_level: number;
  x_restrict: number;
  meta_single_page: {
    original_image_url?: string;
  };
  meta_pages: {
    image_urls: {
      square_medium: string;
      medium: string;
      large: string;
      original: string;
    };
  }[];
  total_view: number;
  total_bookmarks: number;
}

function EnumerateType<T>(enumerate: T): keyof typeof T {}

Argv.createDomain("pixiv_rank", (source) => {
  const values = Object.values(PixivRankType).filter(
    (value) => typeof value !== "string"
  ) as PixivRankType[];
  const rank = values.find((value) => value === +source);
  if (!rank)
    throw new Error(
      `无效的排行榜类型, 必须为以下几项\n` +
        values.map((value) => `${value}->${PixivRankType[value]}`).join(`\n`)
    );
  return rank;
});

template.set(
  "pixiv.rank",
  `
作品名称: {0}
作者: {1}
`.trim()
);

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
    .option("type", "-t <type:pixiv_rank> 排行榜类型", {
      fallback: PixivRankType.week,
    })
    .option("date", "-d <date:date> 排行榜日期, 格式yyyy-mm-dd", {
      fallback: null,
    })
    .option("limit", "-l <size:number> 最多发送图片数量", { fallback: 3 })
    .action(async ({ options, session }) => {
      const date = (
        dayjs(options?.date) ? dayjs(options?.date) : dayjs().subtract(2, "day")
      ).format("YYYY-MM-DD");
      const apiResponse = await hibi.get<{ illusts: PixivIllust[] }>(
        "pixiv/rank",
        {
          params: {
            mode: options?.type ? PixivRankType[options.type] : undefined,
            date: date,
          },
        }
      );
      const illust = randomChoice(
        apiResponse.data.illusts.filter((i) => i.type === "illust")
      );
      await session?.send(
        segment("share", {
          title: illust.title,
          content: illust.user.name,
          url: `https://pixiv.obfs.dev/#/artwork/${illust.id}`,
          image: proxyImage(illust.image_urls.square_medium),
        })
      );
      const images = (
        !illust.meta_single_page.original_image_url
          ? illust.meta_pages.map((page) => page.image_urls.original)
          : [illust.meta_single_page.original_image_url]
      )
        .map(proxyImage)
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
