import type { LooseLessonPlan } from "../../../aila/src/protocol/schema";

const getLessonDetails = (lessonPlan: LooseLessonPlan) => {
  return `The homework should be based on the following lesson details:
  - **Key Stage**: ${lessonPlan.keyStage}
  - **Subject**: ${lessonPlan.subject}
  - **Topic**: ${lessonPlan.topic}
  - **Learning Outcome**: ${lessonPlan.learningOutcome}
  - **Key Learning Points**: ${lessonPlan.keyLearningPoints?.join(", ") || "N/A"}
  - **Misconceptions to Address**: ${lessonPlan.misconceptions?.join(", ") || "None specified"}
  - **Keywords**: ${lessonPlan.keywords?.join(", ") || "N/A"}
  - **Prior Knowledge Required**: ${lessonPlan.priorKnowledge?.join(", ") || "N/A"}
  - **Learning Cycles**: ${lessonPlan.learningCycles?.join(", ") || "N/A"}
  - **Starter Quiz**: ${lessonPlan.starterQuiz?.join(", ") || "N/A"}
//   - **Cycle 1**: ${lessonPlan.cycle1 ? "Covered in the first learning cycle." : "Not provided."}
//   - **Cycle 2**: ${lessonPlan.cycle2 ? "Covered in the second learning cycle." : "Not provided."}
//   - **Cycle 3**: ${lessonPlan.cycle3 ? "Covered in the third learning cycle." : "Not provided."}
  - **Exit Quiz**: ${lessonPlan.exitQuiz ? "An exit quiz is included." : "No exit quiz provided."}
    `;
};

export const additionalHomeworkPrompt = (lessonPlan: LooseLessonPlan) => {
  return `Generate a homework task for the lesson: "${lessonPlan.title}" 
   Ensure the task is clear, subject-specific, and appropriate for students key stage. Keep questions engaging and relevant.

    The homework should be based on the following lesson details:
    ${getLessonDetails}
  
  `;
};

export const additionalHomeworkSystemPrompt = () => {
  return `You are a expert uk teacher generating homework tasks. 
  Ensure the task is clear, subject-specific, and appropriate for students key stage. 
  Keep questions engaging and relevant.`;
};
