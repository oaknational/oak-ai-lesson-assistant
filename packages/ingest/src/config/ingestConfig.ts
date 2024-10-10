import { z } from "zod";

export const IngestConfigSchema = z.object({
  completionModel: z.literal("gpt-4o-2024-08-06"),
  embeddingModel: z.literal("text-embedding-3-large"),
  embeddingDimensions: z.literal(256),
  sourcePartsToInclude: z.union([
    z.literal("all"),
    z.literal("title-subject-key-stage"),
  ]),
});
export type IngestConfig = z.infer<typeof IngestConfigSchema>;
