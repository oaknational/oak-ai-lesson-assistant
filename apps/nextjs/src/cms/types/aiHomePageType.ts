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

interface HomePageData {
  heading: string;
  heroVideo: VideoData;
  belowTheFoldVideo: VideoData;
  seo: SeoData;
}

export type HomePageQueryResult = HomePageData;
