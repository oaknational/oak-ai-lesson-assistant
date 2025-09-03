import type { OakIconName, OakUiRoleToken } from "@oaknational/oak-components";

interface VideoAsset {
  assetId: string;
  thumbTime: number;
  playbackId: string;
}

interface Video {
  asset: VideoAsset;
}

interface VideoData {
  _id: string;
  title: string;
  url: string;
  video: Video;
}

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  openGraphImage: string;
}

interface IconTitleFileItem {
  iconName: OakIconName;
  iconTileBackgroundColour: OakUiRoleToken;
  title: string;
  fileName: string;
  mobileFileName: string;
  file: {
    asset: {
      size: number;
      url: string;
      extension: string;
    };
  };
}

interface GiveFeedbackLink {
  title: string;
  url: string;
  external: string;
}

interface HomePageData {
  heading: string;
  heroVideo: VideoData;
  belowTheFoldVideo: VideoData;
  belowTheFoldVideo2?: VideoData;
  sampleLessons?: IconTitleFileItem[];
  promptExamples?: IconTitleFileItem[];
  giveFeedbackLink: GiveFeedbackLink;
  seo: SeoData;
}

export type HomePageQueryResult = HomePageData;
