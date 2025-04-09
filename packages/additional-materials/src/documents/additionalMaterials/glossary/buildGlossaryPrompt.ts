import type { Action, ContextByMaterialType } from "../configSchema";
import { getLessonDetails } from "../promptHelpers";

export const buildGlossaryPrompt = (
  context: ContextByMaterialType["additional-glossary"],
  action: Action,
) => {
  const { lessonPlan } = context;

  if (action === "refine") {
    return refineGlossaryPrompt(context);
  }

  return `
  Generate a glossary of key terms for the lesson: **"${lessonPlan.title}"**.
  
  **Requirements**:
  - Include **key subject-specific vocabulary** that students need to understand the lesson content.
  - Provide **clear, concise definitions** suitable for key stage ${lessonPlan.keyStage}.
  - Ensure terms are **age-appropriate and relevant** to the learning objectives.
  
  **Lesson Details**:
  ${getLessonDetails(lessonPlan)}
      `;
};

const refineGlossaryPrompt = (
  context: ContextByMaterialType["additional-glossary"],
) => {
  const { lessonPlan, previousOutput, message } = context;
  return `Modify the following glossary based on user feedback.
  
  **Previous Output**:  
  ${JSON.stringify(previousOutput, null, 2)}
  
  **User Request**:  
  ${message}
  
  Adapt the glossary to reflect the request while ensuring it aligns with the following lesson details:
  
  ${getLessonDetails(lessonPlan)}
      `;
};

export const buildGlossarySystemMessage = () => {
  return `
You are an expert UK teacher generating a reading comprehension tasks.

**Guidelines**:
- Ensure tasks are **clear, subject-specific, and appropriate** for the given key stage reading age.
- Keep questions **engaging and relevant** to reinforce learning.
- **Do not** include markdown in your response.
- **Do not** include any americanisms.
  `;
};
