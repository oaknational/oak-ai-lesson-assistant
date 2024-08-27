import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import { ImageAltGen } from ".";

export default async function ImageAltGenPage() {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <ImageAltGen featureFlag={featureFlag} />;
}
