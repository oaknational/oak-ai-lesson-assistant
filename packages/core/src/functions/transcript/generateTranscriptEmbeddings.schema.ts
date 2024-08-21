import z from "zod";

export const generateTranscriptEmbeddingsSchema = {
  data: z.object({
    transcriptId: z.string(),
  }),
};
