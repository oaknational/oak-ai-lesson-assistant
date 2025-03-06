import { z } from "zod";

export const comprehensionTaskSchema = z.object({
  comprehension: z.object({
    title: z.string().min(3).max(100),
    passage: z.string().min(20),
    questions: z.array(
      z.object({
        questionText: z.string().min(5),
        type: z.enum(["multiple-choice", "open-ended"]),
        options: z.array(z.string()).optional(),
        correctAnswer: z.union([z.string(), z.array(z.string())]),
      }),
    ),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
});

export const homeworkMaterialSchema = z.object({
  homework: z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    tasks: z
      .array(z.string())
      .min(1, "At least one task is required.")
      .max(3, "Maximum of 3 tasks allowed."),
  }),
});

export const schemaMap = {
  "additional-comprehension": comprehensionTaskSchema,
  "additional-homework": homeworkMaterialSchema,
};

export type SchemaMapType = keyof typeof schemaMap;
export type HomeworkMaterialType = z.infer<typeof homeworkMaterialSchema>;
export type ComprehensionTaskType = z.infer<typeof comprehensionTaskSchema>;
export type AdditionalMaterialType =
  | HomeworkMaterialType
  | ComprehensionTaskType;

export const isHomeworkMaterial = (
  gen: AdditionalMaterialType | null,
): gen is HomeworkMaterialType => gen !== null && "homework" in gen;

export const isComprehensionMaterial = (
  gen: AdditionalMaterialType | null,
): gen is ComprehensionTaskType => gen !== null && "comprehension" in gen;
