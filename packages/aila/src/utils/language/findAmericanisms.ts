// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./american-british-english-translator.d.ts" />
import { textify } from "@oakai/core/src/models/lessonPlans";
import translator from "american-british-english-translator";

import { LessonPlanKeys, LooseLessonPlan } from "../../protocol/schema";

export type AmericanismIssueBySection = {
  section: string;
  issues: AmericanismIssue[];
};

export type AmericanismIssue = {
  phrase: string;
  issue?: string;
  details?: string;
};

export type TranslationResult = Record<
  string,
  Array<{ [phrase: string]: { issue: string; details: string } }>
>;

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

export function findSectionAmericanisms(
  section: LessonPlanKeys,
  lessonPlan: LooseLessonPlan,
): AmericanismIssueBySection | undefined {
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

export function findAmericanisms(
  lessonPlan: LooseLessonPlan,
): AmericanismIssueBySection[] {
  return Object.keys(lessonPlan).flatMap((section) => {
    const sectionIssues = findSectionAmericanisms(
      section as LessonPlanKeys,
      lessonPlan,
    );
    return sectionIssues && sectionIssues.issues.length > 0
      ? [sectionIssues]
      : [];
  });
}
