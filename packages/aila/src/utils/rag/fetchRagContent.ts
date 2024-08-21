import { RAG } from "@oakai/core/src/rag";
import { PrismaClientWithAccelerate } from "@oakai/db";

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import { minifyLessonPlanForRelevantLessons } from "../lessonPlan/minifyLessonPlanForRelevantLessons";

export async function fetchRagContent({
  title,
  subject,
  topic,
  keyStage,
  id,
  k = 5,
  prisma,
}: {
  title: string;
  subject?: string;
  topic?: string;
  keyStage?: string;
  id: string;
  k: number;
  prisma: PrismaClientWithAccelerate;
}) {
  let content = "[]";

  const rag = new RAG(prisma);
  const ragLessonPlans = await tryWithErrorReporting(
    () => {
      return title && keyStage && subject
        ? rag.fetchLessonPlans({
            chatId: id,
            title,
            keyStage,
            subject,
            topic,
            k,
          })
        : [];
    },
    "Failed to fetch RAG content",
    "info",
  );

  if (ragLessonPlans) {
    const minifiedLessons = ragLessonPlans.map((l) => {
      return minifyLessonPlanForRelevantLessons(l);
    });
    content = JSON.stringify(minifiedLessons, null, 2);
  }

  console.log("Got RAG content, length:", content.length);

  return content;
}
