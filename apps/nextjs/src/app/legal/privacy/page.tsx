import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import PrivacyPolicy from "./privacy";

export default async function PrivacyPage() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <PrivacyPolicy featureFlag={featureFlag} />;
}
