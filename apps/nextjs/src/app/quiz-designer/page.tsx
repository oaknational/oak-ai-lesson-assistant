import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import QuizDesignerPage from "./quiz-designer-page";

export default async function QuizDesigner() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <QuizDesignerPage featureFlag={featureFlag} />;
}
