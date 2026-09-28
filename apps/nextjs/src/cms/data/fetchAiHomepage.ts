import { unstable_cache } from "next/cache";

import { homePageQuery } from "@/cms/queries/homePageQuery";
import { sanityClient } from "@/cms/sanityClient";
import type { HomePageQueryResult } from "@/cms/types/aiHomePageType";

import { CMS_REVALIDATE_SECONDS } from "./cmsCache";

// Cached so homepage renders don't wait on a Sanity round trip. Edits in Sanity
// take up to CMS_REVALIDATE_SECONDS to appear.
export const fetchAiHomepage = unstable_cache(
  async (): Promise<HomePageQueryResult | null> => {
    return sanityClient.fetch<HomePageQueryResult>(homePageQuery);
  },
  ["cms-ai-homepage"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);
