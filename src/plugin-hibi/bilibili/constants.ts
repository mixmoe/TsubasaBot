import { template } from "koishi";

export const TEMPLATE_ROOT = "hibi.bilibili";

export const TEMPLATE_START_PROMPT = `${TEMPLATE_ROOT}.start-prompt` as const;

template.set(TEMPLATE_START_PROMPT, "开始获取Bilibili视频信息");

export const TEMPLATE_VIDEO = `${TEMPLATE_ROOT}.video` as const;

template.set(
  TEMPLATE_VIDEO,
  `
{{title}}
UP主: {{uploader}} (UID:{{uploaderId}})
视频时长: {{duration}}
发布时间: {{published}} ({{relativeDuration}})
观看链接:
https://b23.tv/{{bvid}}
https://b23.tv/av{{aid}}
目前已有:
{{view}}人观看 {{share}}人分享 {{like}}个赞
{{danmaku}}条弹幕 {{favorite}}人收藏 
{{reply}}条评论 {{coin}}个硬币
`.trim(),
);

export const COMMAND_ROOT = "hibi/bilibili";

export const COMMAND_VIDEO = `${COMMAND_ROOT}.video` as const;
