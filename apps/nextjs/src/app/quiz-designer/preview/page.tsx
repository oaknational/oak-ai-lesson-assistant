import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import PreviewRedirect from "./preview-redirect";

export default async function PreviewRedirectPage() {
  const canSeeQuizDesigner = await serverSideFeatureFlag("show-qd");

  if (!canSeeQuizDesigner) {
    redirect("/");
  }
  return <PreviewRedirect />;
}
