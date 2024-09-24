export const homePageQuery = `*[_type == "aiHomepage"] {
    heading,
    heroVideo->{
      _id,
      title,
      url,
      video {
        asset->{
          assetId,
          thumbTime,
          playbackId
        }
      }
    },
    belowTheFoldVideo->{
      _id,
      title,
      url,
      video {
        asset->{
          assetId,
          thumbTime,
          playbackId
        }
      }
    },
    "seo": {
      "metaTitle": seo.metaTitle,
      "metaDescription": seo.metaDescription,
      "openGraphImage": seo.openGraphImage.asset->url
    }
  }[0]`;
