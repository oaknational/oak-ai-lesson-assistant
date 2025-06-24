import {
  type RawQuiz,
} from "@oakai/aila/src/protocol/schemas/quiz/rawQuiz";
import { convertRawQuizToV2 } from "@oakai/aila/src/protocol/schemas/quiz/conversion/rawQuizIngest";
import { isOakEmail } from "@oakai/core/src/utils/isOakEmail";

import { auth, clerkClient } from "@clerk/nextjs/server";

import LessonOverviewQuizContainer from "@/components/Quiz/LessonOverviewQuizContainer";

import rawQuizFixture from "./rawQuizFixture.json";

export default async function TestQuizPage() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await clerkClient.users.getUser(userId);
  const isOakUser = isOakEmail(user.emailAddresses[0]?.emailAddress);
  if (!isOakUser) {
    throw new Error("User is not an Oak user");
  }

  const rawQuiz = rawQuizFixture as NonNullable<RawQuiz>;
  const quizV2 = convertRawQuizToV2(rawQuiz);

  return (
    <LessonOverviewQuizContainer
      quiz={quizV2}
      isMathJaxLesson={true}
    />
  );
}
