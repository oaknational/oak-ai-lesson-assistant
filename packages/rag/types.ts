import type { CompletedLessonPlan } from "../aila/src/protocol/schema";

export type RagLessonPlanResult = {
  rag_lesson_plan_id: string;
  lesson_plan: CompletedLessonPlan;
  key: string;
  value_text: string;
  distance: number;
};

export type RagLogger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};
