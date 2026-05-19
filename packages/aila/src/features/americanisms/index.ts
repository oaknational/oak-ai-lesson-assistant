import { z } from "zod";

import type { AilaDocumentContent } from "./AilaAmericanisms";

export const AMERICANISM_ISSUE_KIND = {
  SPELLING: "American English Spelling",
  PHRASING: "American English",
  MEANING: "Different meanings",
} as const;

const spellingIssueSchema = z.object({
  phrase: z.string(),
  issue: z.literal(AMERICANISM_ISSUE_KIND.SPELLING),
  details: z.string(),
});

const phrasingIssueSchema = z.object({
  phrase: z.string(),
  issue: z.literal(AMERICANISM_ISSUE_KIND.PHRASING),
  details: z.string(),
});

const meaningIssueSchema = z.object({
  phrase: z.string(),
  issue: z.literal(AMERICANISM_ISSUE_KIND.MEANING),
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
