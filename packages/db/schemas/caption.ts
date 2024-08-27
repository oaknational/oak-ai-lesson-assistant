import { z } from "zod";

export const Caption = z.object({
  start: z.number(),
  end: z.number(),
  part: z.string(),
});
