import type { AilaDocumentContent } from "./AilaAmericanisms";

export type AmericanismIssueBySection = {
  section: string;
  issues: AmericanismIssue[];
};

export type AmericanismIssue = {
  phrase: string;
  issue?: string;
  details?: string;
};

export interface AilaAmericanismsFeature {
  findAmericanisms<T extends AilaDocumentContent>(
    document: T,
  ): AmericanismIssueBySection[];
}
