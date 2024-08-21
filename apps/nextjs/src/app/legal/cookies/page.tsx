import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import CookiePolicyContent from "./cookies";

export default async function CookiePolicyContentPage() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <CookiePolicyContent featureFlag={featureFlag} />;
}
