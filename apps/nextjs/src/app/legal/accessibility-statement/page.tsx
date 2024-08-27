import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import AccessibilityStatementContent from "./accessibility-statement";

export default async function AccessibilityStatement() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <AccessibilityStatementContent featureFlag={featureFlag} />;
}
