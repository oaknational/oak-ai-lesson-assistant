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
  chatId,
  userId,
}: {
  title: string;
  subject?: string;
  topic?: string;
  keyStage?: string;
  id: string;
  k: number;
  prisma: PrismaClientWithAccelerate;
  chatId: string;
  userId?: string;
}) {
  const rag = new RAG(prisma, { chatId, userId });
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

  const minifiedLessons = ragLessonPlans?.map((l) => {
    return minifyLessonPlanForRelevantLessons(l);
  });

  return {
    results: minifiedLessons ?? [],
  };
}
