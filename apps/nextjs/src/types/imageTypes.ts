import type { ValidationResult } from "@oakai/api/src/imageGen/validateImageWithOpenAI";
import type { Resource } from "ai-apps/image-alt-generation/types";
import { z } from "zod";

export type ValidatedImage = {
  imageData: ImageResponse;
  imagePrompt: string;
  validationResult: ValidationResult;
};

export interface PageData {
  id?: string;
  path?: string;
  title?: string;
  subject?: string;
  keyStage?: string;
  lessonPlan: LessonPlan;
}

export interface ImageResponse {
  id: string;
  url: string;
  title?: string;
  alt?: string;
  license: string;
  photographer?: string;
  appropriatenessScore?: number;
  appropriatenessReasoning?: string;
  imageSource?: string;
  imagePrompt: string;
  timing: {
    total: number;
    fetch: number;
    validation: number;
  };
}

export type ImagesFromCloudinary = {
  total_count: number;
  time: number;
  next_cursor: string;
  resources: Resource[];
  rate_limit_allowed: number;
  rate_limit_reset_at: string;
  rate_limit_remaining: number;
};

export interface ComparisonColumn {
  id: string;
  selectedImageSource: string | null;
  imageSearchBatch: ImageResponse[] | null;
  isLoading: boolean;
  error: string | null;
}

// infer LessonPlan type from imageLessonPlan schema
export type LessonPlan = z.infer<typeof imageLessonPlan>;

export const imageLessonPlan = z.object({
  title: z.string(),
  subject: z.string(),
  keyStage: z.string(),
  topic: z.string().optional().nullable(),
  learningOutcome: z.string().optional().nullable(),
  learningCycles: z.array(z.string()).optional().nullable(),
  priorKnowledge: z.array(z.string()).optional().nullable(),
  keyLearningPoints: z.array(z.string()).optional().nullable(),
  misconceptions: z
    .array(z.object({ misconception: z.string(), description: z.string() }))
    .optional()
    .nullable(),
  keywords: z
    .array(z.object({ keyword: z.string(), definition: z.string() }))
    .optional()
    .nullable(),
  starterQuiz: z
    .array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()),
        distractors: z.array(z.string()),
      }),
    )
    .optional()
    .nullable(),
  cycle1: z.object({
    title: z.string(),
    durationInMinutes: z.number(),
    explanation: z.object({
      spokenExplanation: z.array(z.string()),
      accompanyingSlideDetails: z.string(),
      imagePrompt: z.string(),
      slideText: z.string(),
    }),
    checkForUnderstanding: z.array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()),
        distractors: z.array(z.string()),
      }),
    ),
    practice: z.string(),
    feedback: z.string(),
  }),
  cycle2: z.object({
    title: z.string(),
    durationInMinutes: z.number(),
    explanation: z.object({
      spokenExplanation: z.array(z.string()),
      accompanyingSlideDetails: z.string(),
      imagePrompt: z.string(),
      slideText: z.string(),
    }),
    checkForUnderstanding: z.array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()),
        distractors: z.array(z.string()),
      }),
    ),
    practice: z.string(),
    feedback: z.string(),
  }),
  cycle3: z.object({
    title: z.string(),
    durationInMinutes: z.number(),
    explanation: z.object({
      spokenExplanation: z.array(z.string()),
      accompanyingSlideDetails: z.string(),
      imagePrompt: z.string(),
      slideText: z.string(),
    }),
    checkForUnderstanding: z.array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()),
        distractors: z.array(z.string()),
      }),
    ),
    practice: z.string(),
    feedback: z.string(),
  }),
  exitQuiz: z
    .array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()),
        distractors: z.array(z.string()),
      }),
    )
    .optional()
    .nullable(),
  additionalMaterials: z.string().optional().nullable(),
});
