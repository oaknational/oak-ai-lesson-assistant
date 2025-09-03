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
    belowTheFoldVideo2->{
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
    sampleLessons[]{
      iconName,
      iconTileBackgroundColour,
      title,
      fileName,
      mobileFileName,
      file{
        asset->{
          size,
          url,
          extension
        }
      }
    },
    promptExamples[]{
      iconName,
      iconTileBackgroundColour,
      title,
      fileName,
      mobileFileName,
      file{
        asset->{
          size,
          url,
          extension
        }
      }
    },

    giveFeedbackLink {
      title,
      url,
      external
    },
    "seo": {
      "metaTitle": seo.metaTitle,
      "metaDescription": seo.metaDescription,
      "openGraphImage": seo.openGraphImage.asset->url
    }
  }[0]`;
