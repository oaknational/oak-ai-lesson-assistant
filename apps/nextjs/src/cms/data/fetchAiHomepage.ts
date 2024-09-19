import { graphqlClient } from "cms/graphQlClient";

export async function fetchAiHomepage(): Promise<any> {
  const homePageQuery = `
    query AiHomepage {
      aiHomepage {
        heading
        heroVideo {
          _id
          title
          url
        }
        belowTheFoldVideo {
          _id
          title
          url
        }
        seo {
          metaTitle
          metaDescription
          openGraphImage {
            asset {
              url
            }
          }
        }
      }
    }
  `;

  const result: any = await graphqlClient.request(homePageQuery);
  return result.aiHomepage ? result.aiHomepage : null;
}
