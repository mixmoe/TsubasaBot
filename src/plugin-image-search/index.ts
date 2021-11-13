import { Context, segment, template } from "koishi";
import * as network from "./network";
import * as ascii2d from "./providers/ascii2d";
import * as ehentai from "./providers/ehentai";
import * as iqdb from "./providers/iqdb";
import * as saucenao from "./providers/saucenao";
import * as tracemoe from "./providers/tracemoe";

template.set("ascii2d", ascii2d.TEMPLATE);
template.set("ehentai", ehentai.TEMPLATE);
template.set("iqdb", iqdb.TEMPLATE);
template.set("saucenao", saucenao.TEMPLATE);
template.set("tracemoe", tracemoe.TEMPLATE);

export function apply(ctx: Context) {
  ctx.plugin(network);
  ctx.command("ascii2d").action(async ({ session }) => {
    await session?.send("来张图");
    const imageMessage = await session?.prompt(30 * 1000);
    const imageUrl = segment
      .parse(imageMessage!)
      .find((value) => value.type === "image")?.data.url;
    const response = await ascii2d.search(imageUrl!);
    return template("ascii2d", {
      results: response.slice(0, 3),
      $mustache: true,
    });
  });
  ctx.command("ehentai").action(async ({ session }) => {
    await session?.send("来张图");
    const imageMessage = await session?.prompt(30 * 1000);
    const imageUrl = segment
      .parse(imageMessage!)
      .find((value) => value.type === "image")?.data.url;
    const response = await ehentai.search(imageUrl!);
    return template("ehentai", {
      results: response.slice(0, 3),
      $mustache: true,
    });
  });
  ctx.command("iqdb").action(async ({ session }) => {
    await session?.send("来张图");
    const imageMessage = await session?.prompt(30 * 1000);
    const imageUrl = segment
      .parse(imageMessage!)
      .find((value) => value.type === "image")?.data.url;
    const response = await iqdb.search(imageUrl!);
    return template("iqdb", {
      results: response.slice(0, 3),
      $mustache: true,
    });
  });
  ctx.command("saucenao").action(async ({ session }) => {
    await session?.send("来张图");
    const imageMessage = await session?.prompt(30 * 1000);
    const imageUrl = segment
      .parse(imageMessage!)
      .find((value) => value.type === "image")?.data.url;
    const response = await saucenao.search(imageUrl!);
    return template("saucenao", {
      results: response.slice(0, 3),
      $mustache: true,
    });
  });
  ctx.command("tracemoe").action(async ({ session }) => {
    await session?.send("来张图");
    const imageMessage = await session?.prompt(30 * 1000);
    const imageUrl = segment
      .parse(imageMessage!)
      .find((value) => value.type === "image")?.data.url;
    const response = await tracemoe.search(imageUrl!);
    return template("tracemoe", {
      results: response.slice(0, 3),
      $mustache: true,
    });
  });
}
