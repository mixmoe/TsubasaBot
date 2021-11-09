import { Context, segment, template } from "koishi";
import * as network from "./network";
import * as ascii2d from "./providers/ascii2d";

template.set("ascii2d", ascii2d.TEMPLATE);

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
}
