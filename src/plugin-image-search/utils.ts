import { request } from "./network";

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await request.get(url, { responseType: "arraybuffer" });
  return Buffer.from(<ArrayBuffer>response.data);
}
