import { sanityClient } from "cms/sanityClient";
import type { PolicyDocument } from "cms/types/policyDocument";

export async function fetchPolicyDocument({
  slug,
}: {
  slug: string;
}): Promise<PolicyDocument | undefined> {
  const query = `*[_type == "aiPolicyPage"]{
  title,
  "slug": slug.current,
  fake_updatedAt,
  body[]{
    ...,                       
  },
  ...seoFields[]               
}`;

  const result = await sanityClient.fetch(query);

  const policyDocument = result.filter((policy) => policy.slug === slug)[0];

  return policyDocument;
}
