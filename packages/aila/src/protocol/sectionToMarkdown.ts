import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import { isArray, isNumber, isObject, isString } from "remeda";

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
      return `${content}\n\n### Explanation\n\n${sectionToMarkdown("explanation", cycle.explanation ?? "…")}\n\n### Check for understanding\n\n${cycle.checkForUnderstanding ? organiseAnswersAndDistractors(cycle.checkForUnderstanding) : "…"}\n\n### Practice\n\n${cycle.practice ?? "…"}\n\n### Feedback\n\n${cycle.feedback ?? "…"}`;
    } catch (e) {
      // Invalid schema
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
          return value
            .map((misconception) => {
              const m = misconception as {
                misconception: string;
                description: string;
              };
              return `### ${m.misconception}\n\n${m.description}`;
            })
            .join("\n\n");
        }

        const firstObject = value[0];

        if (firstObject && Object.keys(firstObject).length === 2) {
          // This is a Key-Value object, and we will pick the first key as the header and the second key as the body
          // TODO - this probably is unreliable, and we should have a better way to detect this
          const keys = Object.keys(firstObject);
          return (
            value
              .filter((v) => typeof v === "object")
              .map((v) => v as object)
              // @ts-expect-error - we know that the keys exist
              .filter((v) => v[keys[0]] && v[keys[1]])
              .map((v) => {
                // @ts-expect-error - we know that the keys exist

                const header = v[keys[0]];
                // @ts-expect-error - we know that the keys exist

                const body = v[keys[1]];
                return `### ${toSentenceCase(header)}\n\n${toSentenceCase(body)}`;
              })
              .join("\n\n")
          );
        }
      }

      return value.map((v) => sectionToMarkdown(key, v)).join("\n\n");
    }
  }
  if (isObject(value)) {
    return Object.entries(value)
      .map(([k, v]) => {
        return `## ${keyToHeading(k)}\n\n${sectionToMarkdown(k, v)}`;
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
      // Combine answers and distractors into a single array
      const allOptions = [
        ...(v.answers ?? []).map((a) => `**${a}**`),
        ...(v.distractors ?? []).map((d) => d),
      ];

      // Sort options ignoring special characters
      const sortedOptions = sortIgnoringSpecialChars(allOptions);

      // Map sorted options with letter prefixes and bullet points
      const answersAndDistractors = sortedOptions
        .map((text, index) => `- ${String.fromCharCode(65 + index)}. ${text}`)
        .join("\n");

      // Return formatted question with options
      return `### ${i + 1}. ${v.question ?? "…"}\n\n${answersAndDistractors}`;
    })
    .join("\n\n");
}
