export interface PixivIllust {
  id: number;
  title: string;
  type: keyof typeof PixivIllustType;
  image_urls: {
    square_medium: string;
    medium: string;
    large: string;
  };
  caption: string;
  restrict: number;
  user: PixivMember["user"];
  tags: {
    name: string;
    translated_name: string;
  }[];
  tools: string[];
  create_date: string;
  page_count: number;
  width: number;
  height: number;
  sanity_level: number;
  meta_single_page: {
    original_image_url?: string;
  };
  meta_pages: {
    image_urls: {
      square_medium: string;
      medium: string;
      large: string;
      original: string;
    };
  }[];
  total_view: number;
  total_bookmarks: number;
  total_comments: number;
}

export interface PixivError {
  error: {
    user_message: string;
    message: string;
    reason: string;
    user_message_details: Record<string, any>;
  };
}

export interface PixivMember {
  user: {
    id: number;
    name: string;
    account: string;
    profile_image_urls: {
      medium: string;
    };
    comment: string;
  };
  profile: {
    webpage: string;
    gender: string;
    birth: string;
    birth_day: string;
    birth_year: number;
    region: string;
    address_id: number;
    country_code: string;
    job: string;
    job_id: number;
    total_follow_users: number;
    total_mypixiv_users: number;
    total_illusts: number;
    total_manga: number;
    total_novels: number;
    total_illust_bookmarks_public: number;
    total_illust_series: number;
    total_novel_series: number;
    background_image_url: null | string;
    twitter_account: string;
    twitter_url: string;
    pawoo_url: string;
    is_premium: boolean;
    is_using_custom_profile_image: boolean;
  };
  profile_publicity: {
    gender: string;
    region: string;
    birth_day: string;
    birth_year: string;
    job: string;
    pawoo: boolean;
  };
  workspace: {
    pc: string;
    monitor: string;
    tool: string;
    scanner: string;
    tablet: string;
    mouse: string;
    printer: string;
    desktop: string;
    music: string;
    desk: string;
    chair: string;
    comment: string;
    workspace_image_url: null | string;
  };
}

export enum PixivRankType {
  day,
  week,
  month,
  day_male,
  day_female,
  week_original,
  week_rookie,
}

export enum PixivIllustType {
  illust,
  manga,
}

export enum PixivSearchType {
  partial_match_for_tags,
  exact_match_for_tags,
  title_and_caption,
}

export enum PixivSearchOrderType {
  date_desc,
  date_asc,
}

export enum PixivSearchDurationType {
  within_last_day,
  within_last_week,
  within_last_month,
}

export type PixivRankData = { illusts: PixivIllust[] };
export type PixivIllustData = { illust: PixivIllust };
export type PixivMemberData = PixivMember;
export type PixivMemberIllustData = {
  illusts: PixivIllust[];
  next_url: string;
};
export type PixivIllustSearchData = {
  illusts: PixivIllust[];
  next_url: string;
  search_span_limit: number;
};
