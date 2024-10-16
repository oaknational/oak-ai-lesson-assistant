import { RAG } from "@oakai/core/src/rag";
import { PrismaClientWithAccelerate } from "@oakai/db";

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import { CompletedLessonPlan } from "../../protocol/schema";
import { minifyLessonPlanForRelevantLessons } from "../lessonPlan/minifyLessonPlanForRelevantLessons";

export type RagLessonPlan = Omit<
  CompletedLessonPlan,
  "starterQuiz" | "exitQuiz"
> & {
  id: string;
};

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
}): Promise<RagLessonPlan[]> {
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

  return ragLessonPlans?.map(minifyLessonPlanForRelevantLessons) ?? [];
}
