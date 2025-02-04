import type { KeyStage, LessonPlan, Subject } from "@prisma/client";
import { z } from "zod";

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

// Keep the flexible type for LangChain compatibility
export type SimilarityResultWithScore = [
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  import("@langchain/core/documents").DocumentInterface,
  number,
];

// Add a more specific type for after validation
export type SimilarityResultWithScoreAndMetadata = [
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  import("@langchain/core/documents").DocumentInterface<{
    id: string;
    lesson_plan_id: string;
  }>,
  number,
];

const MetadataSchema = z.object({
  id: z.string(),
  lesson_plan_id: z.string(),
});

const DocumentSchema = z.object({
  pageContent: z.string(),
  metadata: MetadataSchema,
});

export const SimilarityResultWithScoreSchema = z.tuple([
  DocumentSchema,
  z.number(),
]);

export interface KeyStageAndSubject {
  keyStage?: KeyStage;
  subject?: Subject;
}
