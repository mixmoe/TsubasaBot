import { template } from "koishi";

export const TEMPLATE_ROOT = "hibi.pixiv";

export const TEMPLATE_START_PROMPT = `${TEMPLATE_ROOT}.start-prompt` as const;

template.set(TEMPLATE_START_PROMPT, "开始获取图片信息");

export const TEMPLATE_NOT_FOUND = `${TEMPLATE_ROOT}.not-found` as const;

template.set(TEMPLATE_NOT_FOUND, "没有找到相关图片");

export const TEMPLATE_ILLUST = `${TEMPLATE_ROOT}.illust` as const;

template.set(
  TEMPLATE_ILLUST,
  `
标题: {{title}} (ID: {{illustId}})
作者: {{member}} (ID: {{memberId}})

该作品共有 {{total}} 张图片, 将会发送前 {{send}} 张`.trim(),
);

export const TEMPLATE_MEMBER = `${TEMPLATE_ROOT}.member` as const;

template.set(
  TEMPLATE_MEMBER,
  `
{{avatar}}
作者: {{member}} (ID: {{memberId}})
共 {{illusts}} 份插画, 共获得了 {{bookmarks}} 个收藏

本页共有 {{total}} 张图片, 将会发送本页人气最高的前 {{send}} 张`.trim(),
);

export const TEMPLATE_SEARCH = `${TEMPLATE_ROOT}.search` as const;

template.set(
  TEMPLATE_SEARCH,
  `
  关于 {{keyword}} 的 Pixiv 搜索结果第 {{page}} 页
  
  共搜索到 {{total}} 条结果, 将会发送本页人气最高的前 {{send}} 张`.trim(),
);

export const COMMAND_ROOT = "hibi/pixiv";

export const COMMAND_RANKING = `${COMMAND_ROOT}.ranking` as const;

export const COMMAND_ILLUST = `${COMMAND_ROOT}.illust` as const;

export const COMMAND_MEMBER = `${COMMAND_ROOT}.member` as const;

export const COMMAND_SEARCH = `${COMMAND_ROOT}.search` as const;
