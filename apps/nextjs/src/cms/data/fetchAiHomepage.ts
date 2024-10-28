import { homePageQuery } from "cms/queries/homePageQuery";
import { sanityClient } from "cms/sanityClient";
import { HomePageQueryResult } from "cms/types/aiHomePageType";

export async function fetchAiHomepage(): Promise<HomePageQueryResult | null> {
  const query = homePageQuery;

  const result = await sanityClient.fetch(query);

  return result;
}