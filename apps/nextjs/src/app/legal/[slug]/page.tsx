import { fetchPolicyDocument } from "cms/data/fetchPolicyDocument";
import { redirect } from "next/navigation";

import LegalContent from "./legal";

export default async function PolicyContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const pageData = await fetchPolicyDocument({ slug: params.slug });

  if (!pageData) {
    redirect("/not-found");
  }

  return <LegalContent pageData={pageData} />;
}
