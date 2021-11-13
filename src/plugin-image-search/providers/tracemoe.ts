import * as dayjs from "dayjs";
import * as dayjsDuration from "dayjs/plugin/duration";
import * as FormData from "form-data";
import { template } from "koishi";
import { request } from "../network";
import { downloadImage } from "../utils";

dayjs.extend(dayjsDuration);

export const BASE_URL = "https://api.trace.moe";

export const TEMPLATE = template.from(__filename, ".mustache");

export interface TraceMoeResponse {
  frameCount: number;
  error: string;
  result: {
    anilist?: {
      id: number;
      idMal: number;
      title: { native: string; romaji: string | null; english: string | null };
      synonyms: string[];
      isAdult: boolean;
    };
    filename: string;
    episode: null | number;
    from: number;
    to: number;
    similarity: number;
    video: string;
    image: string;
  }[];
}

export async function search(url: string) {
  const form = new FormData(),
    { buffer, info } = await downloadImage(url);
  form.append("image", buffer, info);
  const { data } = await request.post<TraceMoeResponse>("/search", form, {
    baseURL: BASE_URL,
    headers: form.getHeaders(request.defaults.headers.common),
    params: { anilistInfo: true, butBorders: true },
    responseType: "json",
  });
  if (data.error.length > 0) throw new Error(data.error);
  return data.result
    .filter((result) => typeof result.anilist === "object")
    .map((result) => ({
      preview: result.image,
      similarity: result.similarity * 100,
      name: result.anilist?.title!,
      nsfw: result.anilist?.isAdult!,
      from: dayjs.duration(result.from * 1000).format("HH:mm:ss.SSS"),
      to: dayjs.duration(result.to * 1000).format("HH:mm:ss.SSS"),
      episode: result.episode,
      file: result.filename,
    }))
    .sort((a, b) => a.similarity - b.similarity)
    .reverse();
}
