import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import AdditionalMaterialsUser from "../AdditionalMaterialsUser";

export default async function AdditionalMaterialsTestPage() {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  return <AdditionalMaterialsUser pageData={{ "": "" }} />;
}
