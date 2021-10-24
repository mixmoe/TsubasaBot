import axios from "axios";
import { PixivRankType, PixivIllust } from "./models";

const hibi = axios.create({
  baseURL: "https://api.obfs.dev/api/",
  headers: { "User-Agent": "TsubasaBot (koishi-plugin-hibi)" },
});

export const pixiv = {
  async ranking(params: { mode?: keyof typeof PixivRankType; date?: string }) {
    const response = await axios.get<{ illusts: PixivIllust[] }>(`pixiv/rank`, {
      params,
    });
    return response.data.illusts;
  },
};
