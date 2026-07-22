import { z } from "zod/v3";

export const Caption = z.object({
  start: z.number(),
  end: z.number(),
  part: z.string(),
});
