import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import yaml from "yaml";
import { z } from "zod";

const TextifiableSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.record(z.string(), z.unknown()),
]);

// Simplifies the input to a string for embedding
export function textify(input: unknown): string {
  const validated = TextifiableSchema.parse(input);
  if (Array.isArray(validated)) {
    return validated.map((row) => textify(row)).join("\n");
  } else if (typeof validated === "object") {
    return yaml.stringify(validated);
  } else {
    return validated;
  }
}

const LessonPlanPartSchema = z.object({
  key: z.string(),
  content: z.string(),
  json: z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string(), z.unknown()),
  ]),
});

type LessonPlanPart = z.infer<typeof LessonPlanPartSchema>;

export function getLessonPlanParts({
  lessonPlan,
}: {
  lessonPlan: LooseLessonPlan;
}): LessonPlanPart[] {
  const lessonPlanParts: LessonPlanPart[] = [];

  for (const [key, value] of Object.entries(lessonPlan)) {
    if (["subject", "keyStage", "basedOn"].includes(key)) {
      continue;
    }

    const textContent = textify(value);
    if (shouldSkipContent(textContent, value)) {
      continue;
    }

    const part = LessonPlanPartSchema.parse({
      key,
      content: textContent,
      json: value,
    });
    lessonPlanParts.push(part);
  }

  return lessonPlanParts;
}

function shouldSkipContent(content: string, value: unknown): boolean {
  return !content.trim() || !value || value === "None";
}
