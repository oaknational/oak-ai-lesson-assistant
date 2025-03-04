import { z } from "zod";

export const DummyDocumentSchema = z.object({
  title: z.string(),
  subject: z.string(),
  keyStage: z.string(),
  topic: z.string().optional(),
  body: z.string(),
  basedOn: z
    .object({
      id: z.string(),
      title: z.string(),
    })
    .optional(),
});

export type AilaDummyDocumentContent = z.infer<typeof DummyDocumentSchema>;
