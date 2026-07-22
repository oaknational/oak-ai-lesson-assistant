import { z } from "zod/v3";

export const additionalMaterialsTemplateSchema = z.object({
  lesson_title: z.string(),
  content: z.string(),
});

export type AdditionalMaterialsTemplateData = z.infer<
  typeof additionalMaterialsTemplateSchema
>;
