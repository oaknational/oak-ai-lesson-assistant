import { Apps } from "@oakai/core";
import { prisma } from "@oakai/db";

import { LessonPlanPreview } from "./preview";

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

  const planSections = sharedData.content;
  return planSections;
}

export default async function QuizPreviewPage({
  params,
}: {
  params: { slug: string };
}) {
  console.log("params", params);

  const planSections = await getData(params.slug);

  return <LessonPlanPreview planSections={planSections} />;
}
