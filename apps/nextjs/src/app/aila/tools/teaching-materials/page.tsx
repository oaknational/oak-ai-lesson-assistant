import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import TeachingMaterialsView from "./teachingMaterialsView";

export default async function AdditionalMaterialsTestPage() {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  return <TeachingMaterialsView />;
}
