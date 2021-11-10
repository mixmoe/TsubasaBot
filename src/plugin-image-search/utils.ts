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
