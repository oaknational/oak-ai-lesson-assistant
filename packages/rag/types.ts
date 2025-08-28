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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...args: any[]) => void;
};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
