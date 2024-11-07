import z from "zod";

import { keyStages, subjects } from "../utils/subjects";

export const CategoriseKeyStageAndSubjectResponse = z.object({
  type: z.literal("categorisedKeyStageAndSubject"),
  reasoning: z
    .string()
    .nullable()
    .describe("The reasoning behind the categorisation"),
  keyStage: z
    .enum([...keyStages] as [string, ...string[]])
    .nullable()
    .describe(
      "The key stage of the lesson plan, which must be one of these valid key stages",
    ),
  subject: z
    .enum([...subjects] as [string, ...string[]])
    .nullable()
    .describe(
      "The subject of the lesson plan, which must be one of the valid subject slugs provided",
    ),
  title: z.string().nullable().describe("The title of the lesson plan"),
  topic: z.string().nullable().describe("The topic of the lesson plan"),
  error: z
    .string()
    .nullable()
    .describe("An error message if categorisation is not possible"),
});

export type CategorisedKeyStageAndSubject = z.infer<
  typeof CategoriseKeyStageAndSubjectResponse
>;
