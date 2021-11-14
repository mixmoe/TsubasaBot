import { segment } from "koishi";
import { request } from "./network";

export async function downloadImage(
  url: string,
  filename?: `${string}.${string}`,
) {
  const { data, headers } = await request.get(url, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(<ArrayBuffer>data);
  const info = {
    contentType: headers["content-type"],
    knownLength: buffer.length,
    filename: filename ?? "image.jpg",
  };
  return { buffer, info };
}

export function firstImage(content: string): string | undefined {
  return segment
    .parse(content)
    .find(({ type, data: { url } }) => type === "image" && url?.trim().length)
    ?.data.url;
}

export function MultipleEnumerateType<T>(
  enumerate: T,
  splitter: string | RegExp = /\D+?/,
): (source: string) => (keyof T)[] {
  const keys = Object.keys(enumerate).filter(
      (v) => typeof v === "string" && typeof enumerate[v] === "number",
    ) as (keyof T)[],
    values = Object.values(enumerate).filter(
      (v) => typeof v === "number" && typeof enumerate[v] === "string",
    ) as T[];
  const valueMap = Object.fromEntries(values.map((v, i) => [v, keys[i]]));

  if (keys.length !== values.length || keys.length <= 0)
    throw new Error("EnumerateType: invalid enumerate");

  return (source: string): (keyof T)[] => {
    const selected = source
      .split(splitter)
      .map((v) => v.trim())
      .filter((v) => v.length)
      .filter((value) => typeof valueMap[+value] === "string");
    if (selected.length <= 0)
      throw new Error(
        `未找到有效的枚举值, 可用值为:\n` +
          values.map((value) => `${value}->${valueMap[value]}`).join(`\n`) +
          `\n支持多个值, 用${splitter}分割`,
      );
    return selected.map((value) => valueMap[value]);
  };
}
