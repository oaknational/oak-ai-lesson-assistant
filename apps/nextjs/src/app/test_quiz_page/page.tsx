import {
  type RawQuiz,
  keysToCamelCase,
} from "@oakai/aila/src/protocol/rawQuizSchema";
import { isOakEmail } from "@oakai/core/src/utils/isOakEmail";

import { auth, clerkClient } from "@clerk/nextjs/server";

import LessonOverviewQuizContainer from "@/components/AppComponents/Chat/Quiz/LessonOverviewQuizContainer";

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

  return (
    <LessonOverviewQuizContainer
      questions={keysToCamelCase(rawQuizFixture) as NonNullable<RawQuiz>}
      imageAttribution={[]}
      isMathJaxLesson={true}
    />
  );
}
