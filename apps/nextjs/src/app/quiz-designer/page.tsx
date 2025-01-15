import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import QuizDesignerPage from "./quiz-designer-page";

export default async function QuizDesigner() {
  const canSeeQuizDesigner = await serverSideFeatureFlag("quiz-designer");

  if (!canSeeQuizDesigner) {
    redirect("/");
  }

  return <QuizDesignerPage />;
}
