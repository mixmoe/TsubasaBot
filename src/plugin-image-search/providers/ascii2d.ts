import * as cheerio from "cheerio";
import * as FormData from "form-data";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

export const BASE_URL = "https://ascii2d.net/";

export function parse(body: string) {
  const $ = cheerio.load(body, { decodeEntities: true });
  return _.map($(".item-box"), (item) => {
    const detail = $(".detail-box", item),
      hash = $(".hash", item),
      info = $(".info-box > .text-muted", item),
      [image] = $(".image-box > img", item);

    const [source, author] =
      $(".external", detail).length > 0
        ? $(":first-child > a[rel=noopener]", detail)
        : $(".external > a[rel=noopener]", detail);

    return {
      hash: hash.text(),
      info: info.text(),
      image: new URL(image.attribs.src, BASE_URL).toString(),
      source: { link: source?.attribs.href, text: $(source).text() },
      author: { link: author?.attribs.href, text: $(author).text() },
    };
  });
}

export async function search(url: string, type: "color" | "bovw") {
  const form = new FormData(),
    image = await downloadImage(url);
  form.append("file", image);
  const { headers } = await request.post("/search/multi", form, {
    headers: form.getHeaders(request.defaults.headers),
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
