import { sanityClient } from "@/cms/sanityClient";
import type { PolicyDocument } from "@/cms/types/policyDocument";

export async function fetchPolicyDocument({
  slug,
}: {
  slug: string;
}): Promise<PolicyDocument | undefined> {
  const query = `*[_type == "aiPolicyPage" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  body[]{
    ...,
  },
}`;

  const policyDocument = await sanityClient.fetch<PolicyDocument | null>(
    query,
    { slug },
  );

  return policyDocument ?? undefined;
}
