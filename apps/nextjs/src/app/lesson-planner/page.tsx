import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import LessonPlannerPage from ".";

export default async function LessonPlanner() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <LessonPlannerPage featureFlag={featureFlag} />;
}
