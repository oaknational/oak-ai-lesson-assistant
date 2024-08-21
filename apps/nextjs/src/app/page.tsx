import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import HomePage from "./home-page";

export default async function Page() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");

  return <HomePage featureFlag={featureFlag} />;
}
