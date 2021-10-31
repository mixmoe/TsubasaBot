import { hibi } from "../network";
import {
  BilibiliResponse,
  BilibiliUserData,
  BilibiliVideoData,
} from "./models";

export function apiCallerFactory<T, P>(
  endpoint: `bilibili/v3/${string}`,
): (options: P) => Promise<T> {
  return async (options: P) => {
    const { data } = await hibi.get<BilibiliResponse<T>>(endpoint, {
      params: { ...options },
    });
    if (data.code !== 0) throw new Error(data.message);
    return data.data;
  };
}

export type BilibiliVideoOptions = { aid: number };

export const video = apiCallerFactory<BilibiliVideoData, BilibiliVideoOptions>(
  "bilibili/v3/video_info",
);

export type BilibiliUserInfoOptions = {
  uid: number;
  page?: number;
  size?: number;
};

export const user = apiCallerFactory<BilibiliUserData, BilibiliUserInfoOptions>(
  "bilibili/v3/user_info",
);
