import { getImageData, imageFromBuffer } from "@canvas/image";
import { template } from "koishi";
import { Canvas } from "skia-canvas";
import { hibi } from "../network";
import { src2image } from "../utils";
import { TEMPLATE_ILLUST } from "./constants";
import { PixivIllust } from "./models";

export function randomChoice<T>(array: T[]): T | undefined {
  return array.length > 0
    ? array[Math.floor(Math.random() * array.length)]
    : undefined;
}

export function isR18(tags: PixivIllust["tags"]) {
  return tags.some(({ name }) => name.toLowerCase().startsWith("r-18"));
}

export async function imageAntiCensor(
  url: string,
  gaussian = false,
): Promise<Buffer> {
  const response = await hibi.get(url, { responseType: "arraybuffer" });
  const image = getImageData(
    await imageFromBuffer(new Uint8Array(<ArrayBuffer>response.data)),
  )!;

  const canvas = new Canvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.putImageData(image, 0, 0);

  if (gaussian) {
    ctx.filter = "blur(7px)";
    ctx.drawImage(canvas as any, 0, 0);
    ctx.filter = "none";
  }

  ctx.fillStyle = "black";
  ctx.font = "6px mono";
  ctx.fillText("Sent by TsubasaBot", 0, image.height);
  return canvas.toBuffer("image/png");
}

export function mirrorPixivImage(source: string): string {
  const url = new URL(source);
  url.host = "pximg.obfs.dev";
  url.protocol = "https";
  return url.toString();
}

export async function buildMultiIllustMessages(
  illusts: PixivIllust[],
  limit: number,
  sort = true,
): Promise<string[]> {
  return await Promise.all(
    illusts
      .sort(
        sort
          ? (a, b) =>
              a.total_bookmarks / a.total_view -
              b.total_bookmarks / b.total_view
          : undefined,
      )
      .reverse()
      .slice(0, limit)
      .map(
        async (illust) =>
          template(TEMPLATE_ILLUST, {
            title: illust.title,
            illustId: illust.id,
            member: illust.user.name,
            memberId: illust.user.id,
            total: illust.page_count,
            send: 1,
          }) +
          src2image(
            await imageAntiCensor(
              mirrorPixivImage(illust.image_urls.large),
              isR18(illust.tags),
            ),
          ),
      ),
  );
}

export async function buildSingleIllustMessages(
  illust: PixivIllust,
  limit: number,
): Promise<string[]> {
  const r18 = isR18(illust.tags);
  const buffers = await Promise.all(
    (!illust.meta_single_page.original_image_url
      ? illust.meta_pages.map((page) => page.image_urls.original)
      : [illust.meta_single_page.original_image_url]
    )
      .slice(0, limit)
      .map((url) => imageAntiCensor(mirrorPixivImage(url), r18)),
  );
  return buffers.map((buffer) => src2image(buffer));
}
