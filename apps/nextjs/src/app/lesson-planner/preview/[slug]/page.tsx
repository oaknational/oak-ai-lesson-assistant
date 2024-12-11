import { Apps } from "@oakai/core/src/models/apps";
import { prisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";

import { LessonPlanPreview } from "./preview";

const log = aiLogger("chat");

async function getData(slug: string) {
  const appsModel = new Apps(prisma);

  const sharedData = await appsModel.getSharedContent(slug);

  if (!sharedData) {
    return {
      notFound: true,
    };
  }

  const planSections = sharedData.content;
  return planSections;
}

export type QuizPreviewPageProps = Readonly<{
  params: { readonly slug: string };
}>;

export default async function QuizPreviewPage({
  params,
}: QuizPreviewPageProps) {
  log.info("params", params);

  const planSections = await getData(params.slug);

  return <LessonPlanPreview planSections={planSections} />;
}
