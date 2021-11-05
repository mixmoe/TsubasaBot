import { hibi } from "../network";
import {
  NeteaseBaseResponse,
  NeteaseDetailResponse,
  NeteaseLyricResponse,
  NeteaseSearchResponse,
  NeteaseSongResponse,
} from "./models";

export function apiCallerFactory<T extends NeteaseBaseResponse, P>(
  endpoint: `netease/${string}`,
): (options: P) => Promise<T> {
  return async (options: P) => {
    const { data } = await hibi.get<T>(endpoint, {
      params: { ...options },
    });
    if (data.code !== 200) {
      throw new Error(
        `Netease returned code ${data.code}: ` + JSON.stringify(data),
      );
    }
    return data;
  };
}

export type NeteaseSearchOptions = {
  s: string;
  limit?: number;
  offset?: number;
};

export const search = apiCallerFactory<
  NeteaseSearchResponse,
  NeteaseSearchOptions
>("netease/search");

export type NeteaseDetailOptions = { id: number };

export const detail = apiCallerFactory<
  NeteaseDetailResponse,
  NeteaseDetailOptions
>("netease/detail");

export type NeteaseSongOptions = { id: number; br?: number };

export const song = apiCallerFactory<NeteaseSongResponse, NeteaseSongOptions>(
  "netease/song",
);

export type NeteaseLyricOptions = { id: number };

export const lyric = apiCallerFactory<
  NeteaseLyricResponse,
  NeteaseLyricOptions
>("netease/lyric");
