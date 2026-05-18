// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./american-british-english-translator.d.ts" />
import { textify } from "@oakai/core/src/utils/textify";

import translator from "american-british-english-translator";

import type { AilaAmericanismsFeature } from ".";
import {
  type AmericanismIssue,
  type AmericanismIssueBySection,
  americanismIssueSchema,
} from "../../features/americanisms";

export type AilaDocumentContent = Record<string, unknown>;

// Phrases the translator dictionary flags as Americanisms but which are
// correct British English in Aila's educational contexts — e.g. "gas" as a
// state of matter, which the dictionary maps to "petrol". Filtered so the
// corrector never fires on them and the scorers don't flag them.
const FILTER_OUT_PHRASES: ReadonlySet<string> = new Set([
  "practice",
  "practices",
  "gas",
  "gases",
  "period",
  "periods",
  "fall",
  "falls",
  "connection",
  "connections",
]);

export class AilaAmericanisms<T extends AilaDocumentContent>
  implements AilaAmericanismsFeature
{
  private findSectionAmericanisms(
    section: keyof T,
    document: T,
  ): AmericanismIssueBySection | undefined {
    const sectionContent = document[section];
    if (!sectionContent) return;

    const sectionText = textify(sectionContent);
    const sectionAmericanismScan = translator.translate(sectionText, {
      american: true,
    });

    const issues: AmericanismIssue[] = [];
    Object.values(sectionAmericanismScan).forEach((lineIssues) => {
      lineIssues.forEach((lineIssue) => {
        const [phrase, issueDefinition] = Object.entries(lineIssue)[0] ?? [];
        if (phrase && issueDefinition && !FILTER_OUT_PHRASES.has(phrase)) {
          if (!issues.some((issue) => issue.phrase === phrase)) {
            const parsed = americanismIssueSchema.safeParse({
              phrase,
              ...issueDefinition,
            });
            if (parsed.success) issues.push(parsed.data);
          }
        }
      });
    });

    return { section: String(section), issues };
  }

  public findAmericanisms<U extends AilaDocumentContent = T>(
    document: U,
  ): AmericanismIssueBySection[] {
    return Object.keys(document).flatMap((section) => {
      const sectionIssues = this.findSectionAmericanisms(
        section as keyof T,
        document as unknown as T,
      );
      return sectionIssues && sectionIssues.issues.length > 0
        ? [sectionIssues]
        : [];
    });
  }
}
