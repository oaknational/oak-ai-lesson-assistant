import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import HomePage from "./home-page";

export default async function Page() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  console.log("trigger build");
  return <HomePage featureFlag={featureFlag} />;
}
