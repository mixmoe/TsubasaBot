import * as cheerio from "cheerio";
import * as FormData from "form-data";
import { template } from "koishi";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

export const BASE_URL = "https://saucenao.com";

export const TEMPLATE = template.from(__filename, ".mustache");

export function parse(body: string) {
  const $ = cheerio.load(body, { decodeEntities: true });
  return _.map($(".result"), (result) => {
    const image = $(".resultimage img", result),
      title = $(".resulttitle", result),
      similarity = $(".resultsimilarityinfo", result),
      misc = $(".resultmiscinfo > a", result),
      content = $(".resultcontentcolumn > *", result);
    if (title.length <= 0) return;
    const hiddenImage = image.attr("data-src2"),
      imageUrl = hiddenImage ? hiddenImage : image.attr("src");
    return {
      image: new URL(<string>imageUrl, BASE_URL).toString(),
      hidden: !!hiddenImage,
      title: title.text(),
      similarity: parseFloat(similarity.text()),
      misc: _.map(misc, (m) => m.attribs.href),
      content: _.map(
        content,
        (c) =>
          $(c).text() + (c.tagName === "a" ? `\n${c.attribs.href}\n` : " "),
      )
        .filter((s) => s.trim().length > 0)
        .join(""),
    };
  })
    .filter(<T>(v: T | undefined): v is T => v !== undefined)
    .sort((a, b) => a.similarity - b.similarity)
    .reverse();
}

export const DEFAULT_OPTIONS = { hide: true };

export async function search(
  url: string,
  options: Partial<typeof DEFAULT_OPTIONS> = {},
) {
  options = { ...DEFAULT_OPTIONS, ...options };
  const form = new FormData(),
    { buffer, info } = await downloadImage(url);
  form.append("file", buffer, info);
  if (options.hide) form.append("hide", "3");
  const { data } = await request.post<string>("/search.php", form, {
    headers: form.getHeaders(request.defaults.headers),
    baseURL: BASE_URL,
    responseType: "text",
  });
  return parse(data);
}
