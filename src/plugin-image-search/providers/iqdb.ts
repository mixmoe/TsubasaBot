import * as cheerio from "cheerio";
import * as FormData from "form-data";
import { template } from "koishi";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

export const BASE_URL = "https://iqdb.org/";

export const TEMPLATE = template.from(__filename, ".mustache");

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
      url: new URL(link.attribs.href, BASE_URL).toString(),
      image: new URL(image.attribs.src, BASE_URL).toString(),
      similarity: parseFloat(similarity),
      resolution,
      level: level.toLowerCase(),
    };
  })
    .filter(<T>(v: T | undefined): v is T => v !== undefined)
    .sort((a, b) => a.similarity - b.similarity)
    .reverse();
}

export const DEFAULT_OPTIONS = {
  services: <IqDBServices[]>(
    Object.values(IqDBServices).filter((s) => typeof s === "number")
  ),
  discolor: false,
};

export async function search(
  url: string,
  options: Partial<typeof DEFAULT_OPTIONS> = {},
) {
  options = { ...DEFAULT_OPTIONS, ...options };
  const form = new FormData(),
    { buffer, info } = await downloadImage(url);
  if (options.services)
    options.services.forEach((s) =>
      form.append("service[]", typeof s === "number" ? s : IqDBServices[s]),
    );
  form.append("file", buffer, info);
  if (options.discolor) form.append("forcegray", "on");
  const { data } = await request.post<string>(BASE_URL, form, {
    headers: form.getHeaders(request.defaults.headers),
    responseType: "text",
  });
  return parse(data);
}
