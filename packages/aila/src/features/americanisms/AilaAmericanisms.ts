// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./american-british-english-translator.d.ts" />
import { textify } from "@oakai/core/src/utils/textify";
import translator from "american-british-english-translator";

import type { AilaAmericanismsFeature } from ".";
import type {
  AmericanismIssue,
  AmericanismIssueBySection,
} from "../../features/americanisms";
import type { LessonPlanKey, LooseLessonPlan } from "../../protocol/schema";

export type TranslationResult = Record<
  string,
  Array<{ [phrase: string]: { issue: string; details: string } }>
>;

export class AilaAmericanisms implements AilaAmericanismsFeature {
  private findSectionAmericanisms(
    section: LessonPlanKey,
    lessonPlan: LooseLessonPlan,
  ): AmericanismIssueBySection | undefined {
    const filterOutPhrases = new Set([
      "practice",
      "practices",
      "gas",
      "gases",
      "period",
      "periods",
      "fall",
      "falls",
    ]);

    const sectionContent = lessonPlan[section];
    if (!sectionContent) return;

    const sectionText = textify(sectionContent);
    const sectionAmericanismScan: TranslationResult = translator.translate(
      sectionText,
      { american: true },
    );

    const issues: AmericanismIssue[] = [];
    Object.values(sectionAmericanismScan).forEach((lineIssues) => {
      lineIssues.forEach((lineIssue) => {
        const [phrase, issueDefinition] = Object.entries(lineIssue)[0] ?? [];
        if (phrase && issueDefinition && !filterOutPhrases.has(phrase)) {
          if (!issues.some((issue) => issue.phrase === phrase)) {
            issues.push({ phrase, ...issueDefinition });
          }
        }
      });
    });

    return { section, issues };
  }

  public findAmericanisms(lessonPlan: LooseLessonPlan) {
    return Object.keys(lessonPlan).flatMap((section) => {
      const sectionIssues = this.findSectionAmericanisms(
        section as LessonPlanKey,
        lessonPlan,
      );
      return sectionIssues && sectionIssues.issues.length > 0
        ? [sectionIssues]
        : [];
    });
  }
}
