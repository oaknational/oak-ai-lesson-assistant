import z from "zod";

export const requestGenerationSchema = {
  data: z.object({
    appId: z.string(),
    promptId: z.string(),
    generationId: z.string(),
    promptInputs: z.object({}).passthrough(),
    streamCompletion: z.boolean().default(false),
  }),
  user: z.object({
    external_id: z.string(),
  }),
};
