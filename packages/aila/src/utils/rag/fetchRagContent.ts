import { RAG } from "@oakai/core/src/rag";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { getRelevantLessonPlans } from "@oakai/rag";
import OpenAI from "openai";

import { tryWithErrorReporting } from "../../helpers/errorReporting";
import type { CompletedLessonPlan } from "../../protocol/schema";
import { minifyLessonPlanForRelevantLessons } from "../lessonPlan/minifyLessonPlanForRelevantLessons";
import { parseKeyStage } from "./parseKeyStage";
import { parseSubjects } from "./parseSubjects";

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
    const keyStageSlugs = keyStage ? [parseKeyStage(keyStage)] : null;
    const subjectSlugs = subject ? parseSubjects(subject) : null;
    const results = await getRelevantLessonPlans({
      title,
      subjectSlugs,
      keyStageSlugs,
    });

    return results.map((result) => ({
      id: result.rag_lesson_plan_id,
      ...result.lesson_plan,
    }));
  } catch (cause) {
    throw new Error("Failed to fetch RAG content", { cause });
  }
}
