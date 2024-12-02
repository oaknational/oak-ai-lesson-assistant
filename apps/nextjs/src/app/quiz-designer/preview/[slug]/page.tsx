import { Apps } from "@oakai/core";
import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { updatedAt, createdAt, ...rest } = sharedData;

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

  const questions = await getData(params.slug);

  return <QuizPreview questions={questions} />;
}
