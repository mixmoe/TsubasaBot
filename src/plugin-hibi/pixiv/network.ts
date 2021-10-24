import { PixivRankType, PixivRankData, PixivError } from "./models";
import { hibi } from "../network";

export function proxyPixivImage(source: string): string {
  const url = new URL(source);
  url.host = "pximg.obfs.dev";
  return url.href;
}

export async function rank(options: {
  mode?: keyof typeof PixivRankType;
  date?: string;
}): Promise<PixivRankData> {
  const response = await hibi.get<PixivRankData | PixivError>(`pixiv/rank`, {
    params: { ...options },
  });
  if ("error" in response.data)
    throw new Error(response.data.error.user_message);
  return response.data;
}

export async function illust(id: number) {
  const response = await hibi.get<PixivRankData | PixivError>(`pixiv/illust`, {
    params: { id },
  });
}
