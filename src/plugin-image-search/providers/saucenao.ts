import * as cheerio from "cheerio";
import * as FormData from "form-data";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

const BASE_URL = "https://saucenao.com";

export function parse(body: string) {
  const $ = cheerio.load(body, { decodeEntities: true });
  return _.map($(".result"), (result) => {
    const image = $(".resultimage img", result),
      title = $(".resulttitle", result),
      similarity = $(".resultsimilarityinfo", result),
      misc = $(".resultmiscinfo > a", result),
      content = $(".resultcontentcolumn", result);
    const hiddenImage = image.attr("img-src2"),
      imageUrl = hiddenImage ? hiddenImage : image.attr("src");
    return {
      image: new URL(<string>imageUrl, BASE_URL).toString(),
      hidden: !!hiddenImage,
      title: title.text(),
      similarity: parseFloat(similarity.text()),
      misc: _.map(misc, (m) => m.attribs.href),
      content: _.map(
        content,
        (c) => $(c).text() + (c.tagName === "a" ? "" + c.attribs.href : ""),
      ).join(`\n`),
    };
  })
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
    image = downloadImage(url);
  form.append("file", image);
  if (options.hide) form.append("hide", "3");
  const { data } = await request.post<string>("/search.php", form, {
    headers: form.getHeaders(request.defaults.headers),
    baseURL: BASE_URL,
    responseType: "text",
  });
  return parse(data);
}
