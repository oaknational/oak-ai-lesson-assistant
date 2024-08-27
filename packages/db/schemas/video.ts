import { z } from "zod";

export const Video = z
  .object({
    aspectRatio: z.string(),
    duration: z.number().nullable().optional(),
    id: z.string(),
    muxPlaybackId: z.string().nullable().optional(),
    signedStreamId: z.string(),
    signed: z.boolean(),
    captions: z
      .object({
        ingestId: z.string(),
        transcript: z.string().nullable(),
      })
      .nullable()
      .optional(),
  })
  .nullable()
  .optional();
