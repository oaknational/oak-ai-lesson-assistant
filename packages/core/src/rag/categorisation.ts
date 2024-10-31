import z from "zod";

// Make a new Zod schema for a response from OpenAI for the categoriseKeyStageAndSubject function

export const CategoriseKeyStageAndSubjectResponse = z.object({
  keyStage: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  error: z.string().optional(),
  reasoning: z.string().optional().nullable(),
});

export type CategorisedKeyStageAndSubject = z.infer<
  typeof CategoriseKeyStageAndSubjectResponse
>;
