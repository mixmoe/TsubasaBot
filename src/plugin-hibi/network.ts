import axios from "axios";

export const hibi = axios.create({
  baseURL: "https://api.obfs.dev/api/",
  headers: { "User-Agent": "TsubasaBot (koishi-plugin-hibi)" },
});
