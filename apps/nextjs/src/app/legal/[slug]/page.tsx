import { notFound } from "next/navigation";

import { fetchPolicyDocument } from "@/cms/data/fetchPolicyDocument";

import LegalContent from "./legal";

export type PolicyContentPageProps = Readonly<{
  params: { readonly slug: string };
}>;

export default async function PolicyContentPage({
  params,
}: PolicyContentPageProps) {
  const pageData = await fetchPolicyDocument({ slug: params.slug });

  if (!pageData) {
    notFound();
  }

  return <LegalContent pageData={pageData} />;
}
