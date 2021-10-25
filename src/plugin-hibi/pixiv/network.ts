import {
  PixivRankType,
  PixivRankData,
  PixivError,
  PixivIllustData,
  PixivMemberData,
  PixivIllustType,
  PixivMemberIllustData,
} from "./models";
import { hibi } from "../network";

export function proxyPixivImage(source: string): string {
  const url = new URL(source);
  url.host = "pximg.obfs.dev";
  url.protocol = "https";
  return url.toString();
}

export function apiCallerFactory<T, P extends {}>(
  endpoint: `pixiv/${string}`
): (options: P) => Promise<T> {
  return async (options: P) => {
    const result = await hibi.get<T | PixivError>(endpoint, {
      params: { ...options },
    });
    if ("error" in result.data) {
      throw new Error(result.data.error.user_message);
    }
    return result.data;
  };
}

type PixivRankOptions = {
  mode?: keyof typeof PixivRankType;
  date?: string;
};

export const rank = apiCallerFactory<PixivRankData, PixivRankOptions>(
  "pixiv/rank"
);

type PixivIllustOptions = { id: number };

export const illust = apiCallerFactory<PixivIllustData, PixivIllustOptions>(
  "pixiv/illust"
);

type PixivMemberOptions = { id: number };

export const member = apiCallerFactory<PixivMemberData, PixivMemberOptions>(
  "pixiv/member"
);

type PixivMemberIllustOptions = {
  id: number;
  type?: keyof typeof PixivIllustType;
  page?: number;
};

export const memberIllust = apiCallerFactory<
  PixivMemberIllustData,
  PixivMemberIllustOptions
>("pixiv/member_illust");

