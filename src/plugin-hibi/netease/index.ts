import { Context, segment, template } from "koishi";
import { ForwardMessageBuilder, stamp2time } from "../utils";
import * as constants from "./constants";
import * as netease from "./network";
import { music2seg, sliceLyric } from "./utils";

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

      if (options.first) {
        await session?.send(
          template(constants.TEMPLATE_SEARCH_REPEAT, {
            id: first.id,
            name: first.name,
            artist: first.ar.map(({ name }) => name).join("/"),
            index: 0,
          }),
        );
        return music2seg(first.id);
      }

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

function lyric(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_LYRIC} <id:number>`)
    .option("entire", "-e 将歌词整体发送, 便于复制")
    .alias("网易云歌词", "歌词")
    .action(async ({ options, session }, id) => {
      await session?.send(template(constants.TEMPLATE_START_PROMPT));
      const { username: name, userId: uin } = session!;

      const result = await netease.lyric({ id }),
        forward = new ForwardMessageBuilder(name, +uin!);

      forward.add(template(constants.TEMPLATE_LYRIC_RESULT, { id }));

      if (result.lrc.version > 0) {
        const { lyric } = result.lrc;
        forward.add(
          template(constants.TEMPLATE_LYRIC_SOURCE, {
            type: "原",
            uploaderName: result.lyricUser?.nickname,
          }),
        );
        if (options?.entire) forward.add(lyric);
        else forward.add(...sliceLyric(lyric));
      }

      if (result.tlyric.version > 0) {
        const { lyric } = result.tlyric;
        forward.add(
          template(constants.TEMPLATE_LYRIC_SOURCE, {
            type: "翻译",
            uploaderName: result.transUser?.nickname,
          }),
        );
        if (options?.entire) forward.add(lyric);
        else forward.add(...sliceLyric(lyric));
      }

      await forward.send();
    });
}

function song(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_SONG} <id:number>`, { checkArgCount: true })
    .alias("网易云歌曲", "歌曲直链")
    .option("bitrate", "-b <bitrate> 歌曲比特率", {
      type: ["64000", "128000", "192000", "320000"],
    })
    .option("preview", "-p 将歌曲转换为语音消息(稍慢)")
    .action(async ({ options, session }, id) => {
      await session?.send(template(constants.TEMPLATE_START_PROMPT));
      const { username: name, userId: uin } = session!;

      const {
          songs: [song],
        } = await netease.detail({ id }),
        {
          data: [download],
        } = await netease.song({
          id,
          br: options?.bitrate ? +options.bitrate : undefined,
        }),
        forward = new ForwardMessageBuilder(name, +uin!);

      forward.add(segment.image(song.al.picUrl));

      forward.add(
        template(constants.TEMPLATE_SONG_DETAIL, {
          name: song.name,
          id: song.id,
          aliases: song.alia.join(", "),
          artist: song.ar.map((a) => a.name).join("/"),
          album: song.al.name,
          publish: song.publishTime ? stamp2time(song.publishTime) : "未知",
        }),
      );

      forward.add(
        template(constants.TEMPLATE_SONG_DOWNLOAD, {
          bitrate: `${download.br / 1000}K`,
          size: `${(download.size / 1024 ** 2).toFixed(3)}MB`,
          md5: download.md5,
          url: download.url,
          expire: download.expi,
        }),
      );

      if (options?.preview) {
        const {
          data: [{ url: file }],
        } = await netease.song({ id });
        await session?.send(segment("record", { file }));
      }

      await forward.send();
    });
}

export function apply(ctx: Context) {
  ctx.plugin(search).plugin(lyric).plugin(song);
}
