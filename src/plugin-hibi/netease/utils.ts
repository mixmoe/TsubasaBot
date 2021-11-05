import { segment } from "koishi";

export const music2seg = (id: number) => segment("music", { type: "163", id });

export const sliceLyric = (lyric: string, limit = 20): string[] => {
  const spliced = lyric.split(`\n`).map((line) => line.trim());
  return new Array<string>(Math.ceil(spliced.length / limit))
    .fill(`\n`)
    .map((separator, index) =>
      spliced.slice(index * limit, (index + 1) * limit).join(separator),
    );
};
