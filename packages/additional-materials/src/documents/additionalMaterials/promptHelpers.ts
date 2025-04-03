import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";

export const getLessonTranscript = (transcript: string) => {
  return transcript;
};

export const getLessonDetails = (lessonPlan: LooseLessonPlan) => {
  return `
- **Key Stage**: ${lessonPlan.keyStage}
- **Subject**: ${lessonPlan.subject}
- **Topic**: ${lessonPlan.topic}
- **Learning Outcome**: ${lessonPlan.learningOutcome}

**Key Learning Points**:
${lessonPlan.keyLearningPoints?.map((point) => `- ${point}`).join("\n") ?? "- N/A"}

**Misconceptions to Address**:
${lessonPlan.misconceptions?.map(({ misconception, description }) => `- **${misconception}**: ${description}`).join("\n") ?? "- None specified"}

**Keywords**:
${lessonPlan.keywords?.map(({ keyword, definition }) => `- **${keyword}**: ${definition}`).join("\n") ?? "- N/A"}

**Prior Knowledge Required**:
${lessonPlan.priorKnowledge?.map((pk) => `- ${pk}`).join("\n") ?? "- N/A"}

**Learning Cycles**:
${lessonPlan.learningCycles?.map((cycle) => `- ${cycle}`).join("\n") ?? "- N/A"}


`;
};
