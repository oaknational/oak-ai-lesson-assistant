import type { Action, ContextByMaterialType } from "../configSchema";
import { getLessonDetails } from "../promptHelpers";

export const buildComprehensionPrompt = (
  context: ContextByMaterialType["additional-comprehension"],
  action: Action,
) => {
  const { lessonPlan } = context;

  if (action === "refine") {
    return refineComprehensionPrompt(context);
  }

  return `
Generate a reading comprehension task for the lesson: **"${lessonPlan.title}"**.

**Requirements**:
- The task must be **clear, subject-specific, and age-appropriate** for key stage ${lessonPlan.keyStage}.
- Ensure questions are **engaging, relevant, and aligned with the learning objectives**.
- The task should reinforce the student's understanding of the lesson content.

**Lesson Details**:
${getLessonDetails(lessonPlan)}
  `;
};

const refineComprehensionPrompt = (
  context: ContextByMaterialType["additional-comprehension"],
) => {
  const { lessonPlan, previousOutput, message } = context;

  return `Modify the following comprehension task based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the task to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
  `;
};

export const buildComprehensionSystemMessage = () => {
  return `
You are an expert UK teacher generating a reading comprehension task.

**Guidelines**:
- Ensure tasks are **clear, subject-specific, and appropriate** for the given key stage reading age.
- Keep questions **engaging and relevant** to reinforce learning.
- **Do not** include markdown in your response.
- **Do not** include any americanisms.
  `;
};
