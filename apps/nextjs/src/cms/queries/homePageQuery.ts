export const homePageQuery = `*[_type == "aiHomepage"] {
    heading,
    heroVideo->{
      _id,
      title,
      url
    },
    belowTheFoldVideo->{
      _id,
      title,
      url
    },
    "seo": {
      "metaTitle": seo.metaTitle,
      "metaDescription": seo.metaDescription,
      "openGraphImage": seo.openGraphImage.asset->url
    }
  }[0]`;
