import { unstable_cache } from "next/cache";

import { sanityClient } from "@/cms/sanityClient";
import type { PolicyDocument } from "@/cms/types/policyDocument";

import { CMS_REVALIDATE_SECONDS } from "./cmsCache";

const policyDocumentQuery = `*[_type == "aiPolicyPage" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  body[]{
    ...,
  },
}`;

// The slug argument is part of the cache key, so each document is cached separately.
const fetchPolicyDocumentCached = unstable_cache(
  async (slug: string) =>
    sanityClient.fetch<PolicyDocument | null>(policyDocumentQuery, { slug }),
  ["cms-policy-document"],
  { revalidate: CMS_REVALIDATE_SECONDS },
);

export async function fetchPolicyDocument({
  slug,
}: {
  slug: string;
}): Promise<PolicyDocument | undefined> {
  const policyDocument = await fetchPolicyDocumentCached(slug);

  return policyDocument ?? undefined;
}
