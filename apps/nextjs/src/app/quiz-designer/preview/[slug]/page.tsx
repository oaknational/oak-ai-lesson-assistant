import { Apps } from "@oakai/core";
import { prisma } from "@oakai/db";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import QuizPreview from "./preview";

async function getData(slug: string) {
  const appsModel = new Apps(prisma);
  const sharedData = await appsModel.getSharedContent(slug);
  if (!sharedData) {
    return {
      notFound: true,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { updatedAt, createdAt, ...rest } = sharedData;

  const questions = sharedData.content;

  return questions;
}

export default async function QuizPreviewPage({
  params,
}: {
  params: { slug: string };
}) {
  console.log("params", params);

  const questions = await getData(params.slug);
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  return <QuizPreview questions={questions} featureFlag={featureFlag} />;
}
