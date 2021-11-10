import * as cheerio from "cheerio";
import * as FormData from "form-data";
import { template } from "koishi";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

export const BASE_URLs = {
  eh: new URL("https://upld.e-hentai.org/image_lookup.php"),
  ex: new URL("https://exhentai.org/upld/image_lookup.php"),
} as const;

export const TEMPLATE = template.from(__filename, ".mustache");

export function parse(body: string) {
  const $ = cheerio.load(body);
  return _.map($(".glte > tbody > tr"), (result) => {
    const title = $(".glink", result),
      [image] = $(".gl1e img", result),
      [link] = $(".gl1e a", result),
      type = $(".gl3e .cn", result),
      date = $(".gl3e [id^=posted]", result),
      tags = $(".gl4e table td > div[class]", result);
    return {
      title: title.text(),
      image: image.attribs.src,
      link: link.attribs.href,
      type: type.text().toUpperCase(),
      date: date.text(),
      tags: _.map(tags, (tag) => $(tag).text()),
    };
  });
}

export const DEFAULT_OPTIONS = {
  cover: false,
  deleted: false,
  similar: true,
};

export async function search(
  url: string,
  source: keyof typeof BASE_URLs = "eh",
  options: Partial<typeof DEFAULT_OPTIONS> = {},
) {
  options = { ...DEFAULT_OPTIONS, ...options };
  const form = new FormData(),
    target = BASE_URLs[source],
    { buffer, info } = await downloadImage(url);
  form.append("sfile", buffer, info);
  form.append("f_sfile", "search");
  if (options.cover) form.append("fs_covers", "on");
  if (options.similar) form.append("fs_similar", "on");
  if (options.deleted) form.append("fs_exp", "on");
  const { headers } = await request.post(target.href, form, {
    headers: form.getHeaders(request.defaults.headers.common),
    maxRedirects: 0,
  });
  const { data: result } = await request.get<string>(headers.location, {
    responseType: "text",
    headers: { cookie: "sl=dm_2" },
  });
  return parse(result);
}
