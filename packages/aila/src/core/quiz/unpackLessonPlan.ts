import type { PartialLessonPlan } from "../../protocol/schema";

export function unpackLessonPlanForPrompt(
  lessonPlan: PartialLessonPlan,
): string {
  const sections: string[] = [];

  // Basic information
  const basicInfo = [
    lessonPlan.title && `Title: ${lessonPlan.title}`,
    lessonPlan.subject && `Subject: ${lessonPlan.subject}`,
    lessonPlan.keyStage && `Key Stage: ${lessonPlan.keyStage}`,
    lessonPlan.topic && `Topic: ${lessonPlan.topic}`,
    lessonPlan.learningOutcome &&
      `Learning Outcome: ${lessonPlan.learningOutcome}`,
  ].filter(Boolean);
  if (basicInfo.length > 0) sections.push(basicInfo.join("\n"));

  // Learning cycles
  if (
    Array.isArray(lessonPlan.learningCycles) &&
    lessonPlan.learningCycles.length > 0
  ) {
    const items = lessonPlan.learningCycles.map(
      (cycle, i) => `${i + 1}. ${cycle}`,
    );
    sections.push(`Learning Cycles:\n${items.join("\n")}`);
  }

  // Prior knowledge
  if (
    Array.isArray(lessonPlan.priorKnowledge) &&
    lessonPlan.priorKnowledge.length > 0
  ) {
    const items = lessonPlan.priorKnowledge.map(
      (knowledge, i) => `${i + 1}. ${knowledge}`,
    );
    sections.push(`Prior Knowledge:\n${items.join("\n")}`);
  }

  // Key learning points
  if (
    Array.isArray(lessonPlan.keyLearningPoints) &&
    lessonPlan.keyLearningPoints.length > 0
  ) {
    const items = lessonPlan.keyLearningPoints.map(
      (point, i) => `${i + 1}. ${point}`,
    );
    sections.push(`Key Learning Points:\n${items.join("\n")}`);
  }

  // Misconceptions
  if (
    Array.isArray(lessonPlan.misconceptions) &&
    lessonPlan.misconceptions.length > 0
  ) {
    const items = lessonPlan.misconceptions.map((misconception, i) => {
      const lines = [`${i + 1}. ${misconception.misconception}`];
      if (misconception.description) {
        lines.push(`   Description: ${misconception.description}`);
      }
      return lines.join("\n");
    });
    sections.push(`Misconceptions:\n${items.join("\n")}`);
  }

  // Keywords
  if (Array.isArray(lessonPlan.keywords) && lessonPlan.keywords.length > 0) {
    const items = lessonPlan.keywords.map((keyword, i) => {
      const lines = [`${i + 1}. ${keyword.keyword}`];
      if (keyword.definition) {
        lines.push(`   Definition: ${keyword.definition}`);
      }
      return lines.join("\n");
    });
    sections.push(`Keywords:\n${items.join("\n")}`);
  }

  // Additional materials
  if (lessonPlan.additionalMaterials) {
    sections.push(`Additional Materials: ${lessonPlan.additionalMaterials}`);
  }

  // Reference information
  if (lessonPlan.basedOn) {
    sections.push(
      `Based On: ${lessonPlan.basedOn.title} (ID: ${lessonPlan.basedOn.id})`,
    );
  }

  return sections.join("\n\n");
}
