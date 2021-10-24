export interface PixivIllust {
  id: number;
  title: string;
  type: "illust" | "manga";
  image_urls: {
    square_medium: string;
    medium: string;
    large: string;
  };
  caption: string;
  restrict: number;
  user: {
    id: number;
    name: string;
    account: string;
    profile_image_urls: {
      medium: string;
    };
  };
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
  x_restrict: number;
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
}

export interface PixivError {
  error: {
    user_message: string;
    message: string;
    reason: string;
    user_message_details: Record<string, any>;
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

export type PixivRankData = { illusts: PixivIllust[] };
