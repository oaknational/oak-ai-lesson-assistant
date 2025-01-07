import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import QuizDesignerPage from "./quiz-designer-page";

export default async function QuizDesigner() {
  const canSeeQuizDesigner = await serverSideFeatureFlag("show-qd");

  if (!canSeeQuizDesigner) {
    redirect("/");
  }

  return <QuizDesignerPage />;
}
