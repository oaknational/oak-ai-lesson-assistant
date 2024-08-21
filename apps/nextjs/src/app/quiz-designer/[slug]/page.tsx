import { auth } from "@clerk/nextjs/server";
import getSessionOutput from "ai-apps/common/getSessionOutput";
import { quizAppStateSchema } from "ai-apps/quiz-designer/state/types";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import QuizDesignerPage from "./generation-page";

const quizStateSchema = quizAppStateSchema.omit({
  rateLimit: true,
});

async function getData(slug: string) {
  const { userId }: { userId: string | null } = auth();
  if (typeof userId !== "string") {
    throw new Error("User not found");
  }
  const { data } = await getSessionOutput(userId, slug);
  const parsedData = quizStateSchema.parse(data);

  return parsedData;
}

export default async function GenerationsPage({
  params,
}: {
  params: { slug: string };
}) {
  const featureFlag = await serverSideFeatureFlag("lesson-planning-assistant");
  const data = await getData(params.slug);
  return <QuizDesignerPage data={data} featureFlag={!!featureFlag} />;
}
