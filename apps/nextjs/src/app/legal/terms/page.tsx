import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import TermsAndConditions from "./terms";

export default async function TermsPage() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <TermsAndConditions featureFlag={featureFlag} />;
}
