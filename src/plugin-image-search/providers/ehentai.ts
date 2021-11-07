import * as cheerio from "cheerio";
import * as FormData from "form-data";
import * as _ from "lodash";
import { request } from "../network";
import { downloadImage } from "../utils";

export const BASE_URLs = {
  eh: "https://upld.e-hentai.org/image_lookup.php",
  ex: "https://exhentai.org/upld/image_lookup.php",
};

export function parse(body: string) {
  const $ = cheerio.load(body);
  return _.map($(".gl1t"), (result) => {
    const title = $(".glink", result),
      [image] = $(".gl3t img", result),
      [link] = $(".gl3t > a", result),
      type = $(".gl5t .cs", result),
      date = $(".gl5t [id^=posted]", result),
      page = $(".gl5t .ir + div", result);
    return {
      title: title.text(),
      image: image.attribs.src,
      link: link.attribs.href,
      type: type.text(),
      date: date.text(),
      page: page.text(),
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
    image = await downloadImage(url);
  form.append("sfile", image);
  form.append("f_sfile", "search");
  if (options.cover) form.append("fs_covers", "on");
  if (options.similar) form.append("fs_similar", "on");
  if (options.deleted) form.append("fs_exp", "on");
  const { headers } = await request.post(BASE_URLs[source], form, {
    headers: form.getHeaders(request.defaults.headers),
    maxRedirects: 0,
  });
  const destinationUrl = new URL(headers.location);
  destinationUrl.searchParams.set("inline_set", "dm_t");
  const { data: result } = await request.get<string>(destinationUrl.href, {
    responseType: "text",
  });
  return parse(result);
}
