import { notFound } from "next/navigation";

import { fetchPolicyDocument } from "@/cms/data/fetchPolicyDocument";

import AccessibilityStatementPage from "./accessibility-statement";

export default async function Page() {
  const pageData = await fetchPolicyDocument({
    slug: "accessibility-statement",
  });

  if (!pageData) {
    notFound();
  }

  return <AccessibilityStatementPage pageData={pageData} />;
}
