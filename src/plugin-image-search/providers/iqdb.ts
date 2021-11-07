import * as cheerio from "cheerio";
import * as FormData from "form-data";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

export const BASE_URL = "https://iqdb.org/";

export enum IqDBServices {
  danbooru = 1,
  konachan = 2,
  yandere = 3,
  gelbooru = 4,
  sankaku_channel = 5,
  e_shuushuu = 6,
  zerochan = 11,
  anime_pictures = 13,
}
export function parse(body: string) {
  const $ = cheerio.load(body);
  return _.map($("table"), (result) => {
    const content = $(result).text(),
      [link] = $("td.image > a", result),
      [image] = $("td.image img", result);
    if (!link) return;
    const [, similarity] = content.match(/(\d+%)\s*similarity/)!,
      [, resolution, level] = content.match(/(\d+×\d+)\s*\[(\w+)\]/)!;
    return {
      url: link.attribs.href,
      image: image.attribs.src,
      similarity: parseFloat(similarity),
      resolution,
      level: level.toLowerCase(),
    };
  })
    .filter(<T>(result: T | undefined): result is T => result !== undefined)
    .sort((a, b) => a.similarity - b.similarity)
    .reverse();
}

export async function search(
  url: string,
  options: { services?: IqDBServices[]; discolor?: boolean },
) {
  const form = new FormData(),
    image = downloadImage(url);
  if (options.services)
    options.services.forEach((s) =>
      form.append("service[]", typeof s === "number" ? s : IqDBServices[s]),
    );
  form.append("file", image);
  if (options.discolor) form.append("forcegray", "on");
  const { data } = await request.post<string>(BASE_URL, form, {
    headers: form.getHeaders(request.defaults.headers),
    responseType: "text",
  });
  return parse(data);
}
