import * as cheerio from "cheerio";
import { template } from "koishi";
import * as _ from "lodash";
import { request } from "../network";

export const BASE_URL = "https://ascii2d.net/";

export const TEMPLATE = template.from(__filename, ".mustache");

export function parse(body: string) {
  const $ = cheerio.load(body, { decodeEntities: true });
  return _.map($(".item-box"), (item) => {
    const detail = $(".detail-box", item),
      hash = $(".hash", item),
      info = $(".info-box > .text-muted", item),
      [image] = $(".image-box > img", item);

    const [source, author] = $("a[rel=noopener]", detail);

    if (!source && !author) return;

    return {
      hash: hash.text(),
      info: info.text(),
      image: new URL(image.attribs.src, BASE_URL).toString(),
      source: source
        ? { link: source.attribs.href, text: $(source).text() }
        : undefined,
      author: author
        ? { link: author.attribs.href, text: $(author).text() }
        : undefined,
    };
  }).filter(<T>(v: T | undefined): v is T => v !== undefined);
}

export async function search(url: string, type: "color" | "bovw" = "color") {
  const { headers } = await request.get("/search/url/" + url, {
    baseURL: BASE_URL,
    maxRedirects: 0,
  });
  const destinationUrl = headers.location.replace(`/color/`, `/${type}/`);
  const { data: result } = await request.get<string>(destinationUrl, {
    baseURL: BASE_URL,
    responseType: "text",
  });
  return parse(result);
}
