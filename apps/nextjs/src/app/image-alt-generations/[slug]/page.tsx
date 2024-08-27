import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import { ShareAlt } from "./share";

export default async function ShareImageAlt({
  params,
}: {
  params: { slug: string };
}) {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <ShareAlt slug={params.slug} featureFlag={featureFlag} />;
}
