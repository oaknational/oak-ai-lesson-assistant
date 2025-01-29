import { homePageQuery } from "@/cms/queries/homePageQuery";
import { sanityClient } from "@/cms/sanityClient";
import type { HomePageQueryResult } from "@/cms/types/aiHomePageType";

export async function fetchAiHomepage(): Promise<HomePageQueryResult | null> {
  const query = homePageQuery;

  const result = await sanityClient.fetch<HomePageQueryResult>(query);

  return result;
}
