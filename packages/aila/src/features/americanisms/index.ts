import { z } from "zod";

import type { AilaDocumentContent } from "./AilaAmericanisms";

const spellingIssueSchema = z.object({
  phrase: z.string(),
  issue: z.literal("American English Spelling"),
  details: z.string(),
});

const phrasingIssueSchema = z.object({
  phrase: z.string(),
  issue: z.literal("American English"),
  details: z.string(),
});

const meaningIssueSchema = z.object({
  phrase: z.string(),
  issue: z.literal("Different meanings"),
  details: z.record(z.string()),
});

export const americanismIssueSchema = z.discriminatedUnion("issue", [
  spellingIssueSchema,
  phrasingIssueSchema,
  meaningIssueSchema,
]);

export type AmericanismIssue = z.infer<typeof americanismIssueSchema>;

export type AmericanismIssueBySection = {
  section: string;
  issues: AmericanismIssue[];
};

export interface AilaAmericanismsFeature {
  findAmericanisms<T extends AilaDocumentContent>(
    document: T,
  ): AmericanismIssueBySection[];
}
