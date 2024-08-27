import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import ComparativeJudgementPage from "./share-page";

export default async function CJSharePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params?.slug;
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <ComparativeJudgementPage slug={slug} featureFlag={!!featureFlag} />;
}
