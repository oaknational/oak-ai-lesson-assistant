import { z } from "zod";

// Doc blocks

const title = z.object({
  type: z.literal("title"),
  text: z.string(),
});

const labelValue = z.object({
  label: z.string(),
  value: z.string(),
});

const labelValueArray = z.object({
  type: z.literal("labelValue"),
  items: z.array(labelValue),
});

const answer = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

const question = z.object({
  question: z.string(),
  answers: z.array(answer),
});

const quizBlock = z.object({
  type: z.literal("quiz"),
  questions: z.array(question),
});

// A new type for directly mapping named placeholders
const placeholdersBlock = z.object({
  type: z.literal("placeholders"),
  map: z.record(z.string(), z.string()),
});

export const block = z.union([
  title,
  labelValueArray,
  quizBlock,
  placeholdersBlock,
]);
export type Block = z.infer<typeof block>;

export const blocksSchema = z.array(block);
export type Blocks = z.infer<typeof blocksSchema>;

// Resource schemas

export const glossaryTemplate = z.union([title, labelValueArray]);
export type GlossaryTemplate = z.infer<typeof glossaryTemplate>;

export const quizTemplate = z.union([title, quizBlock]);
export type QuizTemplate = z.infer<typeof quizTemplate>;

export const comprehensionTemplate = z.union([title, placeholdersBlock]);
export type ComprehensionTemplate = z.infer<typeof comprehensionTemplate>;
