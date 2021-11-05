export type NeteaseBaseResponse = { code: number };

export interface NeteaseSongInfo {
  name: string;
  id: number;
  pst: number;
  t: number;
  ar: { id: number; name: string; tns: string[]; alias: string[] }[];
  alia: string[];
  fee: number;
  al: { id: number; name: string; picUrl: string; tns: string[] };
  h: { br: number; fid: number; size: number; vd: number };
  m: NeteaseSongInfo["h"];
  l: NeteaseSongInfo["h"];
  publishTime: number;
  copyright: number;
}

export interface NeteaseSearchResponse extends NeteaseBaseResponse {
  needLogin: boolean;
  result: { songs?: NeteaseSongInfo[]; songCount: number };
}

export interface NeteaseDetailResponse extends NeteaseBaseResponse {
  songs: NeteaseSongInfo[];
}

export interface NeteaseSongDownload {
  id: number;
  url: string;
  br: number;
  size: number;
  md5: string;
  code: number;
  expi: number;
  type: string;
  level: string;
  encodeType: string;
}

export interface NeteaseSongResponse extends NeteaseBaseResponse {
  data: NeteaseSongDownload[];
}

export interface NeteaseLyricResponse extends NeteaseBaseResponse {
  sgc: boolean;
  sfy: boolean;
  qfy: boolean;
  lyricUser?: {
    id: number;
    nickname: string;
    demand: number;
    status: number;
    userid: number;
    uptime: number;
  };
  transUser?: NeteaseLyricResponse["lyricUser"];
  lrc: { version: string; lyric: string } | { version: 0; lyric: "" };
  klyric: NeteaseLyricResponse["lrc"];
  tlyric: NeteaseLyricResponse["lrc"];
}
