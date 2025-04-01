import { z } from "zod";

import { baseContext } from "../comprehension/schema";

export const glossarySchema = z.object({
  glossary: z.array(
    z.object({
      term: z.string().min(1, "Term is required"),
      definition: z.string().min(1, "Definition is required"),
      example: z.string().optional(),
    }),
  ),
});

export type GlossarySchema = z.infer<typeof glossarySchema>;

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
