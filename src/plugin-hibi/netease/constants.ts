import { template } from "koishi";

export const TEMPLATE_ROOT = "hibi.netease";

export const TEMPLATE_NOT_FOUND = `${TEMPLATE_ROOT}.not-found` as const;

template.set(TEMPLATE_NOT_FOUND, "没有找到符合条件的歌曲");

export const TEMPLATE_BAD_INPUT = `${TEMPLATE_ROOT}.illegal-input` as const;

template.set(TEMPLATE_BAD_INPUT, "输入错误, 请重新执行指令");

export const TEMPLATE_START_PROMPT = `${TEMPLATE_ROOT}.start-prompt` as const;

template.set(TEMPLATE_START_PROMPT, "开始获取相关歌曲信息");

export const TEMPLATE_SEARCH_PREFIX = `${TEMPLATE_ROOT}.search-prefix` as const;

template.set(
  TEMPLATE_SEARCH_PREFIX,
  "歌曲共得到{{total}}条搜索结果, 回复歌曲序号以获取相应歌曲",
);

export const TEMPLATE_SEARCH_REPEAT = `${TEMPLATE_ROOT}.search-repeat` as const;

template.set(
  TEMPLATE_SEARCH_REPEAT,
  "[{{index}}] {{name}} - {{artist}} (ID:{{id}})",
);

export const TEMPLATE_LYRIC_RESULT = `${TEMPLATE_ROOT}.lyric-result` as const;

template.set(
  TEMPLATE_LYRIC_RESULT,
  "已获取到歌曲 ID:{{id}} 的歌词, 歌词为LRC格式, 请复制后自行保存",
);

export const TEMPLATE_LYRIC_SOURCE = `${TEMPLATE_ROOT}.lyric-source` as const;

template.set(TEMPLATE_LYRIC_SOURCE, "{{type}}歌词 提供者: {{uploaderName}}");

export const TEMPLATE_SONG_DETAIL = `${TEMPLATE_ROOT}.song-detail` as const;

template.set(
  TEMPLATE_SONG_DETAIL,
  `
歌曲名: {{name}} (ID:{{id}})
别名: {{aliases}}
歌手: {{artist}}  专辑: {{album}}
发布时间: {{publish}}
`.trim(),
);

export const TEMPLATE_SONG_DOWNLOAD = `${TEMPLATE_ROOT}.song-download` as const;

template.set(
  TEMPLATE_SONG_DOWNLOAD,
  `
歌曲比特率: {{bitrate}}
大小: {{size}}
MD5: {{md5}}

下载链接: {{url}} (将在{{expire}}秒后过期)
`.trim(),
);

export const COMMAND_ROOT = "hibi/netease";

export const COMMAND_SEARCH = `${COMMAND_ROOT}.search` as const;

export const COMMAND_LYRIC = `${COMMAND_ROOT}.lyric` as const;

export const COMMAND_SONG = `${COMMAND_ROOT}.song` as const;
