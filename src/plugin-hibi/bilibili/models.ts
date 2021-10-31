export interface BilibiliResponse<T = undefined> {
  code: number;
  message: string;
  ttl?: number;
  data: T;
}

export interface BilibiliVideoData {
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;
  ctime: number;
  desc: string;
  duration: number;
  owner: {
    mid: number;
    name: string;
    face: string;
  };
  stat: {
    view: number;
    danmaku: number;
    reply: number;
    favorite: number;
    coin: number;
    share: number;
    now_rank: number;
    his_rank: number;
    like: number;
  };
  cid: number;
  pages: {
    cid: number;
    page: number;
    part: string;
    from: string;
    dmlink: string;
  }[];
  tag: { tag_id: number; tag_name: string; likes: number; cover: string }[];
  relates: {
    aid: number;
    pic: string;
    title: string;
    owner: BilibiliVideoData["owner"];
    stat: BilibiliVideoData["stat"];
  }[];
  short_link: string;
  bvid: string;
}

export interface BilibiliUserData {
  card: {
    mid: string;
    name: string;
    sex: string;
    face: string;
    birthday: string;
    fans: number;
    friend: number;
    attention: number;
    sign: string;
    level_info: {
      current_level: number;
      current_min: number;
      current_exp: number;
      next_exp: number | string;
    };
    nameplate: {
      nid: number;
      name: string;
      image: string;
      level: string;
      condition: string;
    };
    official_verify: {
      type: number;
      desc: string;
      role: number;
      title: string;
    };
    archive: {
      order: { title: string; value: string }[];
      count: number;
      item: {
        title: string;
        subtitle: string;
        tname: string;
        cover: string;
        uri: string;
        param: string;
        play: number;
        danmaku: number;
        ctime: number;
        author: string;
        bvid: string;
        first_cid: number;
      }[];
    };
    //TODO: season, favourite, article
  };
}

export type BilibiliVideoResponse = BilibiliResponse<BilibiliVideoData>;
export type BilibiliUserResponse = BilibiliResponse<BilibiliUserData>;
