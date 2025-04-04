import { z } from "zod";

import { baseContext } from "../comprehension/schema";

export const glossarySchema = z.object({
  glossary: z.array(
    z.object({
      term: z.string().min(1, "Term is required"),
      definition: z.string().min(1, "Definition is required"),
    }),
  ),
});

export type GlossarySchema = z.infer<typeof glossarySchema>;

export const isGlossary = (data: unknown): data is GlossarySchema => {
  const result = glossarySchema.safeParse(data);
  return result.success;
};

export const glossaryContextSchema = z.object({
  ...baseContext,
  previousOutput: glossarySchema.nullish(),
  options: z
    .object({
      includeDefinitions: z.boolean().default(true),
      format: z.enum(["list", "table"]),
    })
    .nullish(),
});
