import { LessonPlanSchemaWhilstStreaming } from "@oakai/aila/src/protocol/schema";
import { prisma } from "@oakai/db";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isTruthy } from "remeda";

import LessonFinder from "./LessonFinder";

export default async function AdditionalMaterialsSpikePage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;

  if (!userId) {
    redirect("/");
  }
  const lessons = await prisma.appSession.findMany({
    where: {
      userId: userId,
    },
  });

  const parsedLessons = lessons
    .map((lesson) => {
      if (
        !lesson.output ||
        typeof lesson.output !== "object" ||
        Array.isArray(lesson.output) ||
        !("lessonPlan" in lesson.output)
      ) {
        return null;
      }
      const parsedLesson = LessonPlanSchemaWhilstStreaming.parse(
        lesson.output.lessonPlan,
      );

      return {
        sessionId: lesson.id ?? "",
        lessonTitle: parsedLesson.title ?? "",
        keyStage: parsedLesson.keyStage ?? "",
        subject: parsedLesson.subject ?? "",
        hasThreeCycles:
          !!parsedLesson.cycle1 &&
          !!parsedLesson.cycle2 &&
          !!parsedLesson.cycle3,
      };
    })
    .filter((lesson) => lesson?.hasThreeCycles)
    .filter(isTruthy);

  return <LessonFinder lessons={parsedLessons} />;
}
