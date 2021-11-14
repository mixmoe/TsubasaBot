import { Context, template } from "koishi";
import { ForwardMessageBuilder } from "../plugin-hibi/utils";
import * as constants from "./constants";
import * as network from "./network";
import * as ascii2d from "./providers/ascii2d";
import * as ehentai from "./providers/ehentai";
import * as iqdb from "./providers/iqdb";
import * as saucenao from "./providers/saucenao";
import * as tracemoe from "./providers/tracemoe";
import { firstImage, MultipleEnumerateType } from "./utils";

export enum SupportedProviders {
  ascii2d,
  ehentai,
  iqdb,
  saucenao,
  tracemoe,
}

export const providersMap = {
  [SupportedProviders.ascii2d]: ascii2d.search,
  [SupportedProviders.ehentai]: ehentai.search,
  [SupportedProviders.iqdb]: iqdb.search,
  [SupportedProviders.saucenao]: saucenao.search,
  [SupportedProviders.tracemoe]: tracemoe.search,
};

export const templateMap = {
  [SupportedProviders.ascii2d]: constants.TEMPLATE_ASCII2D,
  [SupportedProviders.ehentai]: constants.TEMPLATE_EHENTAI,
  [SupportedProviders.iqdb]: constants.TEMPLATE_IQDB,
  [SupportedProviders.saucenao]: constants.TEMPLATE_SAUCENAO,
  [SupportedProviders.tracemoe]: constants.TEMPLATE_TRACEMOE,
};

export function combine(ctx: Context) {
  ctx
    .command(`${constants.COMMAND_COMBINE}`, { minInterval: 30 * 1000 })
    .alias("以图搜图", "聚合搜图")
    .shortcut("以图搜番", { options: { engines: ["saucenao", "tracemoe"] } })
    .option("engines", "-e <engines>", {
      type: MultipleEnumerateType(SupportedProviders),
    })
    .option("limit", "-l <limit:posint>", { fallback: 3 })
    .action(async ({ session, options }) => {
      const engines =
        options?.engines?.map((e) => SupportedProviders[e]) ??
        Object.keys(providersMap).map<SupportedProviders>(Number);
      let image = firstImage(session?.content ?? "");
      if (!image) {
        await session?.send(template(constants.TEMPLATE_ASK_IMAGE));
        const promptResponse = await session?.prompt(30 * 1000).catch();
        image = firstImage(promptResponse ?? "");
      }
      if (!image) return template(constants.TEMPLATE_BAD_INPUT);

      const { username: name, userId: uin } = session!,
        forward = new ForwardMessageBuilder(name, +uin!);

      await session?.send(
        template(
          constants.TEMPLATE_START_PROMPT,
          engines.map((e) => SupportedProviders[e]).join(),
        ),
      );

      await Promise.all(
        engines.map(async (engine: number) => {
          const provider = providersMap[engine],
            templateName = templateMap[engine];
          const results = await provider(image).catch(() => undefined);
          if (!results || results.length <= 0) return;
          forward.add(
            ...results
              .slice(undefined, options?.limit)
              .map((result) =>
                template(templateName, { results: result, $mustache: true }),
              ),
          );
        }),
      );

      await forward.send();
    });
}

export function apply(ctx: Context) {
  ctx.plugin(network).plugin(combine);
}
