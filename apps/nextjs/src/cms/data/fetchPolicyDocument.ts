import { sanityClient } from "cms/sanityClient";

export interface PolicyDocument {
  title: string;
  slug: string;
  fake_updatedAt: string;
  // Borrowed from OWA where they have recommended leaving body as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}

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
