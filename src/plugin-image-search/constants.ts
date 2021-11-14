import { template } from "koishi";
import { TEMPLATE as ASCII2D_TEMPLATE_STRING } from "./providers/ascii2d";
import { TEMPLATE as EHENTAI_TEMPLATE_STRING } from "./providers/ehentai";
import { TEMPLATE as IQDB_TEMPLATE_STRING } from "./providers/iqdb";
import { TEMPLATE as SAUCENAO_TEMPLATE_STRING } from "./providers/saucenao";
import { TEMPLATE as TRACEMOE_TEMPLATE_STRING } from "./providers/tracemoe";

export const TEMPLATE_ROOT = "image-search";

export const TEMPLATE_START_PROMPT = `${TEMPLATE_ROOT}.start-prompt` as const;

template.set(TEMPLATE_START_PROMPT, "开始搜了, 用的是{0}");

export const TEMPLATE_ASK_IMAGE = `${TEMPLATE_ROOT}.ask-image` as const;

template.set(TEMPLATE_ASK_IMAGE, "图呢?");

export const TEMPLATE_BAD_INPUT = `${TEMPLATE_ROOT}.bad-input` as const;

template.set(TEMPLATE_BAD_INPUT, "没图, 不搜了");

export const TEMPLATE_ASCII2D = `${TEMPLATE_ROOT}.ascii2d` as const;

template.set(TEMPLATE_ASCII2D, ASCII2D_TEMPLATE_STRING);

export const TEMPLATE_EHENTAI = `${TEMPLATE_ROOT}.ehentai` as const;

template.set(TEMPLATE_EHENTAI, EHENTAI_TEMPLATE_STRING);

export const TEMPLATE_IQDB = `${TEMPLATE_ROOT}.iqdb` as const;

template.set(TEMPLATE_IQDB, IQDB_TEMPLATE_STRING);

export const TEMPLATE_SAUCENAO = `${TEMPLATE_ROOT}.saucenao` as const;

template.set(TEMPLATE_SAUCENAO, SAUCENAO_TEMPLATE_STRING);

export const TEMPLATE_TRACEMOE = `${TEMPLATE_ROOT}.tracemoe` as const;

template.set(TEMPLATE_TRACEMOE, TRACEMOE_TEMPLATE_STRING);

export const COMMAND_ROOT = "image-search";

export const COMMAND_COMBINE = `${COMMAND_ROOT}.combine` as const;
