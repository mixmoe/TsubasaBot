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
