import { z } from "zod";

const DEFAULT_COMPLETION_TEMPERATURE = 0.7 as const;

export const IngestConfigSchema = z.object({
  completionModel: z.literal("gpt-4o-2024-08-06"),
  completionTemperature: z.literal(DEFAULT_COMPLETION_TEMPERATURE),
  embeddingModel: z.literal("text-embedding-3-large"),
  embeddingDimensions: z.literal(256),
  sourcePartsToInclude: z.union([
    z.literal("all"),
    z.literal("title-subject-key-stage"),
  ]),
  source: z.union([
    z.object({
      type: z.literal("oak-db"),
    }),
    z.object({
      type: z.literal("csv"),
      filePath: z.string(),
    }),
  ]),
});
export type IngestConfig = z.infer<typeof IngestConfigSchema>;