import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { RagLessonPlans } from "@oakai/core/src/models/ragLessonPlans";
import { RAG } from "@oakai/core/src/rag";
<<<<<<< Updated upstream
import type { PrismaClientWithAccelerate } from "@oakai/db";
=======
import { PrismaClientWithAccelerate } from "@oakai/db";
import OpenAI from "openai";
>>>>>>> Stashed changes

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import type { CompletedLessonPlan } from "../../protocol/schema";
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
  try {
    // const openAiClient = createOpenAIClient({
    //   app: "lesson-assistant",
    //   chatMeta: {
    //     userId,
    //     chatId,
    //   },
    // });
    const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const ragLessonPlans_ = new RagLessonPlans(prisma, openAiClient);
    await ragLessonPlans_.getRelevantLessonPlans({ title });
  } catch (cause) {
    console.log(cause);
  }

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
