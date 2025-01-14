import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import PreviewRedirect from "./preview-redirect";

export default async function PreviewRedirectPage() {
  const canSeeQuizDesigner = await serverSideFeatureFlag("quiz-designer");

  if (!canSeeQuizDesigner) {
    redirect("/");
  }
  return <PreviewRedirect />;
}
