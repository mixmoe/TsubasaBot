import * as fs from "fs";
import * as path from "path";
import { request } from "./network";

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await request.get(url, { responseType: "arraybuffer" });
  return Buffer.from(<ArrayBuffer>response.data);
}

export function readTemplate(file: string, ext = ".mustache"): string {
  const { root, dir, name } = path.parse(file);
  return fs.readFileSync(path.format({ root, dir, name, ext }), "utf8");
}

export function removeUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
