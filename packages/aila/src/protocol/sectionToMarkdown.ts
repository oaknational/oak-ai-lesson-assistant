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

function renderCycle(value: unknown) {
  try {
    const cycle = CycleOptionalSchema.parse(value);

    const sections = {
      title: cycle.title ?? "…",
      explanation:
        sectionToMarkdown("explanation", cycle.explanation ?? "…") ?? "…",
      checkForUnderstanding: cycle.checkForUnderstanding
        ? organiseAnswersAndDistractors(cycle.checkForUnderstanding)
        : "…",
      practice: cycle.practice ?? "…",
      feedback: cycle.feedback ?? "…",
    };

    return `## ${sections.title}

### Explanation

${sections.explanation}

### Check for understanding

${sections.checkForUnderstanding}

### Practice

${sections.practice}

### Feedback

${sections.feedback}`;
  } catch {
    return `## There's been a problem

It looks like this learning cycle hasn't generated properly. Tap **Retry** or ask for this section to be regenerated.`;
  }
}

function renderMisconceptions(value: readonly unknown[]): string {
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

function renderStringArrayAsBullets(value: readonly string[]): string {
  return value.map((v) => `- ${v}`).join("\n\n");
}

function renderTwoKeyObjectArray(value: readonly unknown[]): string {
  const firstObject = value[0];
  if (
    !firstObject ||
    typeof firstObject !== "object" ||
    Object.keys(firstObject).length !== 2
  ) {
    return "";
  }

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

function renderObject(value: Record<string, unknown>): string {
  return Object.entries(value)
    .map(([k, v]) => {
      const content = sectionToMarkdown(k, v) ?? "";
      return `## ${keyToHeading(k)}\n\n${content}`;
    })
    .join("\n\n");
}

function renderArray(key: string, value: readonly unknown[]): string {
  if (value.every((v): v is string => typeof v === "string")) {
    return renderStringArrayAsBullets(value);
  }

  if (typeof value[0] === "object") {
    if (key === "starterQuiz" || key === "exitQuiz") {
      return organiseAnswersAndDistractors(value as QuizOptional);
    }

    if (key === "misconceptions") {
      return renderMisconceptions(value);
    }

    const firstObject = value[0];
    if (firstObject && Object.keys(firstObject).length === 2) {
      return renderTwoKeyObjectArray(value);
    }
  }

  return value.map((v) => sectionToMarkdown(key, v) ?? "").join("\n\n");
}

export function sectionToMarkdown(
  key: string,
  value: unknown,
): string | undefined {
  if (key.includes("cycle")) {
    return renderCycle(value);
  }

  if (isArray(value)) {
    return renderArray(key, value);
  }
  if (isObject(value)) {
    return renderObject(value);
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
