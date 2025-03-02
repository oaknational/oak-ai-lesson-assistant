import type { CompletedLessonPlan } from "../aila/src/protocol/schema";

export type RagLessonPlanResult = {
  ragLessonPlanId: string;
  oakLessonId: number | null;
  oakLessonSlug: string;
  lessonPlan: CompletedLessonPlan;
  matchedKey: string;
  matchedValue: string;
  distance: number;
};

export type RagLogger = {
  info: (...args: string[]) => void;
  error: (...args: string[]) => void;
};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
