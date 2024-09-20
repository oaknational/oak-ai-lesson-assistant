export interface AiHomepage {
  heading: string;
  heroVideo: {
    _id: string;
    title: string;
    url: string;
  };
  belowTheFoldVideo: {
    _id: string;
    title: string;
    url: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    openGraphImage: string;
  };
}
