import z from "zod";

export const notifyModerationTeachingMaterialsSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    id: z.string(),
    justification: z.string(),
    categories: z.array(z.string()),
    userAction: z.string(),
    violationType: z.string(),
  }),
};
