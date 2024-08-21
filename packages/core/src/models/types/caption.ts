import z from "zod";

export const CaptionSchema = z.object({
  end: z.number(),
  part: z.string(),
  start: z.number(),
});

export const CaptionsSchema = z.array(CaptionSchema);

export type Caption = z.infer<typeof CaptionSchema>;
export type Captions = z.infer<typeof CaptionsSchema>;
