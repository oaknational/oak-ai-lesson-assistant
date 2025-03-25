import { notFound, redirect } from "next/navigation";

import { getChatById } from "@/app/actions";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import AdditionalMaterials from "../AdditionalMaterials";

export default async function AdditionalMaterialsTestPage({
  params,
}: {
  params: { readonly slug: string };
}) {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }
  const pageData = await getChatById(params.slug);

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
