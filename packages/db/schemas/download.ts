import { z } from "zod/v3";

import { ZLesson } from "./lesson";

export const Download = z.object({
  id: z.number(),
  lesson: ZLesson,
  download: z.array(
    z.object({
      ext: z.string(),
      type: z.string(),
      label: z.string(),
      exists: z.boolean(),
    }),
  ),
});
