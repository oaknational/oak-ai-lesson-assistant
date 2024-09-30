import { fetchPolicyDocument } from "cms/data/fetchPolicyDocument";
import { notFound } from "next/navigation";

import LegalContent from "./legal";

export default async function PolicyContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const pageData = await fetchPolicyDocument({ slug: params.slug });

  if (!pageData) {
    notFound();
  }

  return <LegalContent pageData={pageData} />;
}
