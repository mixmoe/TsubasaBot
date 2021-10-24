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

export async function illust(id: number): Promise<PixivIllustData> {
  const response = await hibi.get<PixivIllustData | PixivError>(
    `pixiv/illust`,
    {
      params: { id },
    }
  );
  if ("error" in response.data)
    throw new Error(response.data.error.user_message);
  return response.data;
}

export async function member(id: number): Promise<PixivMemberData> {
  const response = await hibi.get<PixivMemberData | PixivError>(
    `pixiv/member`,
    {
      params: { id },
    }
  );
  if ("error" in response.data)
    throw new Error(response.data.error.user_message);
  return response.data;
}

export async function memberIllust(
  id: number,
  options: { type?: keyof typeof PixivIllustType; page?: number }
): Promise<PixivMemberIllustData> {
  const response = await hibi.get<PixivMemberIllustData | PixivError>(
    `pixiv/member_illust`,
    {
      params: { ...options, id },
    }
  );
  if ("error" in response.data)
    throw new Error(response.data.error.user_message);
  return response.data;
}
