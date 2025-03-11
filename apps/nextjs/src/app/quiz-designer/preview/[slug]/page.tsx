import { Apps } from "@oakai/core";
import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import QuizPreview from "./preview";

const log = aiLogger("qd");

async function getData(slug: string) {
  const appsModel = new Apps(prisma);
  const sharedData = await appsModel.getSharedContent(slug);
  if (!sharedData) {
    return {
      notFound: true,
    };
  }

  const questions = sharedData.content;

  return questions;
}

export type QuizPreviewPageProps = Readonly<{
  params: { readonly slug: string };
}>;

export default async function QuizPreviewPage({
  params,
}: QuizPreviewPageProps) {
  log.info("params", params);

  const canSeeQuizDesigner = await serverSideFeatureFlag("quiz-designer");

  if (!canSeeQuizDesigner) {
    redirect("/");
  }

  const questions = await getData(params.slug);

  return <QuizPreview questions={questions} />;
}
