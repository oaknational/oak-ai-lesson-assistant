import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import yaml from "yaml";

// Simplifies the input to a string for embedding
export function textify(input: string | string[] | object): string {
  if (Array.isArray(input)) {
    return input.map((row) => textify(row)).join("\n");
  } else if (typeof input === "object") {
    return yaml.stringify(input);
  } else {
    return input;
  }
}

export function getLessonPlanParts({
  lessonPlan,
}: {
  lessonPlan: LooseLessonPlan;
}) {
  const lessonPlanParts: {
    key: string;
    content: string;
    json: (LooseLessonPlan[keyof LooseLessonPlan] & object) | string | string[];
  }[] = [];
  for (const [key, value] of Object.entries(lessonPlan)) {
    if (["subject", "keyStage", "basedOn"].includes(key)) {
      // Skip these keys
      continue;
    }

    const textContent = textify(value);
    const lessonPlanPart = {
      key: key,
      content: textContent,
      json: value,
    };
    if (!textContent.trim() || !value || value === "None") {
      // Skip empty content
      console.log("Skipping empty content");
      continue;
    }
    lessonPlanParts.push(lessonPlanPart);
  }

  return lessonPlanParts;
}
