import type { LooseLessonPlan } from "../../protocol/schema";

export function unpackLessonPlanForPrompt(lessonPlan: LooseLessonPlan): string {
  const sections: string[] = [];

  // Basic information
  if (lessonPlan.title) sections.push(`Title: ${lessonPlan.title}`);
  if (lessonPlan.subject) sections.push(`Subject: ${lessonPlan.subject}`);
  if (lessonPlan.keyStage) sections.push(`Key Stage: ${lessonPlan.keyStage}`);
  if (lessonPlan.topic) sections.push(`Topic: ${lessonPlan.topic}`);

  // Learning outcomes and objectives
  if (lessonPlan.learningOutcome)
    sections.push(`Learning Outcome: ${lessonPlan.learningOutcome}`);

  if (
    Array.isArray(lessonPlan.learningCycles) &&
    lessonPlan.learningCycles.length > 0
  ) {
    sections.push("Learning Cycles:");
    lessonPlan.learningCycles.forEach((cycle, index) => {
      sections.push(`${index + 1}. ${cycle}`);
    });
  }

  // Knowledge and understanding
  if (
    Array.isArray(lessonPlan.priorKnowledge) &&
    lessonPlan.priorKnowledge.length > 0
  ) {
    sections.push("Prior Knowledge:");
    lessonPlan.priorKnowledge.forEach((knowledge, index) => {
      sections.push(`${index + 1}. ${knowledge}`);
    });
  }

  if (
    Array.isArray(lessonPlan.keyLearningPoints) &&
    lessonPlan.keyLearningPoints.length > 0
  ) {
    sections.push("Key Learning Points:");
    lessonPlan.keyLearningPoints.forEach((point, index) => {
      sections.push(`${index + 1}. ${point}`);
    });
  }

  // Misconceptions
  if (
    Array.isArray(lessonPlan.misconceptions) &&
    lessonPlan.misconceptions.length > 0
  ) {
    sections.push("Misconceptions:");
    lessonPlan.misconceptions.forEach((misconception, index) => {
      sections.push(`${index + 1}. ${misconception.misconception}`);
      if (misconception.description) {
        sections.push(`   Description: ${misconception.description}`);
      }
    });
  }

  // Keywords
  if (Array.isArray(lessonPlan.keywords) && lessonPlan.keywords.length > 0) {
    sections.push("Keywords:");
    lessonPlan.keywords.forEach((keyword, index) => {
      sections.push(`${index + 1}. ${keyword.keyword}`);
      if (keyword.definition) {
        sections.push(`   Definition: ${keyword.definition}`);
      }
    });
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
