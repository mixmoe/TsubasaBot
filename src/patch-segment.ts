import { segment } from "koishi";

export function image(
  from: string | Buffer | ArrayBuffer,
  data?: segment.Data,
): string {
  if (typeof from === "string") {
    return segment("image", { file: from, ...data });
  } else {
    const buffer = from instanceof Buffer ? from : Buffer.from(from);
    return segment("image", {
      file: "base64://" + buffer.toString("base64"),
      ...data,
    });
  }
}

Object.defineProperty(segment, "image", { get: () => image });
