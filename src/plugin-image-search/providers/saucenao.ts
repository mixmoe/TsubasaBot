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
      content: _.map(content, (element) => {
        let result = $(element).text();
        switch (element.tagName) {
          case "a":
            result += `↪️${element.attribs.href}`;
            break;
          case "br":
            result += "\n";
            break;
        }
        return result;
      })
        .filter((s) => s.length > 0)
        .join(""),
    };
  })
    .filter(<T>(v: T | undefined): v is T => v !== undefined)
    .sort((a, b) => a.similarity - b.similarity)
    .reverse();
}

export async function search(url: string, hide = true) {
  const form = new FormData(),
    { buffer, info } = await downloadImage(url);
  form.append("file", buffer, info);
  if (hide) form.append("hide", "3");
  const { data } = await request.post<string>("/search.php", form, {
    headers: form.getHeaders(request.defaults.headers),
    baseURL: BASE_URL,
    responseType: "text",
  });
  return parse(data);
}
