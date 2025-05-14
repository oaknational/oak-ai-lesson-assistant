import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import ResourcesContents from "./resources-contents";

export default async function AdditionalMaterialsTestPage() {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  return <ResourcesContents />;
}
