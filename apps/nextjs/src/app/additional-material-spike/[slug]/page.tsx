import { notFound } from "next/navigation";

import { getChatById } from "@/app/actions";

import AdditionalMaterials from "../AdditionalMaterials";

export default async function AdditionalMaterialsTestPage({
  params,
}: {
  params: { readonly slug: string };
}) {
  const pageData = await getChatById(params.slug);

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
