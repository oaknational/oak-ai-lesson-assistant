import { z } from "zod";

import { refinementSchema } from "../refinement/schema";
import { baseContext } from "../sharedSchema";

// Output from LLM

export const glossarySchema = z.object({
  lessonTitle: z.string(),
  glossary: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
      }),
    )
    .describe("Glossary can have at most 15 term and definition pairs"),
});

export type GlossarySchema = z.infer<typeof glossarySchema>;

export const isGlossary = (data: unknown): data is GlossarySchema => {
  const result = glossarySchema.safeParse(data);
  return result.success;
};

// Prompt context

export const glossaryContextSchema = z.object({
  ...baseContext,
  previousOutput: glossarySchema.nullish(),
  options: z
    .object({
      includeDefinitions: z.boolean().default(true),
      format: z.enum(["list", "table"]),
    })
    .nullish(),
  refinement: z.array(refinementSchema).nullish(),
});
