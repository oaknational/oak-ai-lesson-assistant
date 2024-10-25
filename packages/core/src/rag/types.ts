import { KeyStage, LessonPlan, Subject } from "@prisma/client";

export interface FilterOptions {
  key_stage_id?: object;
  subject_id?: object;
}

export interface LessonPlanWithPartialLesson extends LessonPlan {
  lesson: {
    id: string;
    slug: string;
    title: string;
  };
}

export type SimilarityResultWithScore = [
  import("@langchain/core/documents").DocumentInterface<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >,
  number,
];

export interface KeyStageAndSubject {
  keyStage?: KeyStage;
  subject?: Subject;
}
