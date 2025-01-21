import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import { isArray, isNumber, isObject, isString } from "remeda";
import { z } from "zod";

import { toSentenceCase } from "../../../../apps/nextjs/src/utils/toSentenceCase";
import type { QuizOptional } from "./schema";
import { CycleOptionalSchema, QuizOptionalSchema } from "./schema";

export function sortIgnoringSpecialChars(strings: string[]): string[] {
  // Function to normalize strings by removing *, -, and spaces
  const normalize = (str: string) => str.replace(/[*\-\s]/g, "");

  // Sort the array using the normalized values for comparison
  return strings.sort((a, b) => {
    const normalizedA = normalize(a);
    const normalizedB = normalize(b);
    return normalizedA.localeCompare(normalizedB);
  });
}

const keyToHeadingMappings = {
  spokenExplanation: "Teacher explanation",
  imagePrompt: "Image search suggestion",
  cycle1: "Learning cycle 1",
  cycle2: "Learning cycle 2",
  cycle3: "Learning cycle 3",
};

export function keyToHeading(key: string) {
  if (key in keyToHeadingMappings) {
    return keyToHeadingMappings[key as keyof typeof keyToHeadingMappings];
  }
  return camelCaseToSentenceCase(key);
}
export function sectionToMarkdown(
  key: string,
  value: unknown,
  // headingLevel = 2, TODO support providing a heading level for consistent heading hierarchy
): string | undefined {
  if (key.includes("cycle")) {
    try {
      const cycle = CycleOptionalSchema.parse(value);
      const content = `## ${cycle.title ?? "…"}\n\n`;
      const explanation =
        sectionToMarkdown("explanation", cycle.explanation ?? "…") ?? "…";
      return `${content}\n\n### Explanation\n\n${explanation}\n\n### Check for understanding\n\n${cycle.checkForUnderstanding ? organiseAnswersAndDistractors(cycle.checkForUnderstanding) : "…"}\n\n### Practice\n\n${cycle.practice ?? "…"}\n\n### Feedback\n\n${cycle.feedback ?? "…"}`;
    } catch {
      return "## There's been a problem\n\nIt looks like this learning cycle hasn't generated properly. Tap **Retry** or ask for this section to be regenerated.";
    }
  }

  if (isArray(value)) {
    if (value.every((v): v is string => typeof v === "string")) {
      // Render arrays of strings as bullets
      return value.map((v) => `- ${v}`).join("\n\n");
    } else {
      if (typeof value[0] === "object") {
        if (key === "starterQuiz" || key === "exitQuiz") {
          return organiseAnswersAndDistractors(value as QuizOptional);
        }

        if (key === "misconceptions") {
          const MisconceptionSchema = z.object({
            misconception: z.string(),
            description: z.string(),
          });

          return value
            .map((misconception) => {
              try {
                const m = MisconceptionSchema.parse(misconception);
                return `### ${m.misconception}\n\n${m.description}`;
              } catch {
                return "";
              }
            })
            .filter(Boolean)
            .join("\n\n");
        }

        const firstObject = value[0];

        if (firstObject && Object.keys(firstObject).length === 2) {
          const [key1, key2] = Object.keys(firstObject);
          if (!key1 || !key2) return "";

          return value
            .filter((v) => typeof v === "object")
            .map((v) => v as Record<string, string>)
            .filter(
              (v) =>
                Object.prototype.hasOwnProperty.call(v, key1) &&
                Object.prototype.hasOwnProperty.call(v, key2),
            )
            .map((v) => {
              const header = v[key1] ?? "…";
              const body = v[key2] ?? "…";
              return `### ${toSentenceCase(header)}\n\n${toSentenceCase(body)}`;
            })
            .join("\n\n");
        }
      }

      return value.map((v) => sectionToMarkdown(key, v) ?? "").join("\n\n");
    }
  }
  if (isObject(value)) {
    return Object.entries(value)
      .map(([k, v]) => {
        const content = sectionToMarkdown(k, v) ?? "";
        return `## ${keyToHeading(k)}\n\n${content}`;
      })
      .join("\n\n");
  }
  if (isString(value)) {
    return value;
  }
  if (isNumber(value)) {
    return `${value}`;
  }
}

export function organiseAnswersAndDistractors(quiz: QuizOptional) {
  return QuizOptionalSchema.parse(quiz)
    .map((v, i) => {
      const answers = (v.answers ?? []).map((a) => `- **${a}**`);
      const distractors = (v.distractors ?? []).map((d) => `- ${d}`);
      const answersAndDistractors = sortIgnoringSpecialChars([
        ...answers,
        ...distractors,
      ]).join("\n");
      return `### ${i + 1}. ${v.question ?? "…"}\n\n${answersAndDistractors}`;
    })
    .join("\n\n");
}
