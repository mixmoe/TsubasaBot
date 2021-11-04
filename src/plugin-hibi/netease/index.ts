import { Context, template } from "koishi";
import * as constants from "./constants";
import * as netease from "./network";
import { music2seg } from "./utils";

function search(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_SEARCH} <keyword:text>`, {
      checkArgCount: true,
    })
    .alias("搜歌", "网易云搜歌")
    .shortcut("点歌", { options: { first: true }, fuzzy: true })
    .option("first", "-f 直接发送第一个搜索结果", { fallback: false })
    .option("page", "-p <page:posint> 结果页数", { fallback: 1 })
    .option("limit", "-l <limit:posint> 每页数量", { fallback: 10 })
    .action(async ({ options = {}, session }, keyword) => {
      const { limit = 10, page = 1 } = options;

      if (!options.first)
        await session?.send(template(constants.TEMPLATE_START_PROMPT));

      const {
        result: { songs = [], songCount = 0 },
      } = await netease.search({
        s: keyword.trim(),
        limit,
        offset: (page - 1) * limit,
      });

      const [first] = songs;

      if (!first) return template(constants.TEMPLATE_NOT_FOUND);

      if (options.first) return music2seg(first.id);

      let message = template(constants.TEMPLATE_SEARCH_PREFIX, {
        total: songCount,
      });

      songs.forEach((song, index) => {
        message +=
          "\n" +
          template(constants.TEMPLATE_SEARCH_REPEAT, {
            id: song.id,
            name: song.name,
            artist: song.ar.map(({ name }) => name).join("/"),
            index: index + 1,
          });
      });

      await session?.send(message);

      const response = await session?.prompt(30 * 1000).catch();

      return response
        ? +response - 1 in songs
          ? music2seg(songs[+response - 1].id)
          : template(constants.TEMPLATE_BAD_INPUT)
        : undefined;
    });
}

export function apply(ctx: Context) {
  ctx.plugin(search);
}
