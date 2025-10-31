import type { ContextByMaterialType } from "../configSchema";
import {
  getLessonDetails,
  getQuizAvoids,
  getQuizRequirements,
  getQuizStructure,
  getQuizSystemMessage,
} from "../promptHelpers";
import { refinementMap } from "../refinement/schema";

export const buildExitQuizPrompt = (
  context: ContextByMaterialType["additional-exit-quiz"],
) => {
  const { lessonPlan } = context;

  if (context.refinement) {
    return refineExitQuizPrompt(context);
  }

  return `
TASK: Write a 10-question MULTIPLE CHOICE EXIT QUIZ for a class of pupils in a UK school.

PURPOSE: This EXIT QUIZ will assess pupils' understanding of the key learning from today's lesson. The quiz is designed to:
1. Check if pupils have met the learning objective
2. Identify any misconceptions that remain
3. Highlight areas where pupils may need further support

The EXIT QUIZ should be appropriate for the age of pupils in ${lessonPlan.keyStage} and the subject ${lessonPlan.subject}. 

**Lesson Details**:
${getLessonDetails(lessonPlan)}

${getQuizStructure()}

${getQuizRequirements()}

INCLUDE:
- Cover the MAIN LEARNING POINTS from the lesson
- Test application of knowledge, not just recall
- Include at least one question on each of the KEY CONCEPTS covered
- Check for understanding of the KEYWORDS taught
- Address any MISCONCEPTIONS highlighted in the lesson plan
- Use PLAUSIBLE DISTRACTORS that are:
    - Similar in length and style to the correct answer
    - Based on common errors or misunderstandings
    - Designed to check for deeper understanding
- At least one higher-order thinking question (application, analysis, evaluation)

${getQuizAvoids()}

  `;
};

const refineExitQuizPrompt = (
  context: ContextByMaterialType["additional-exit-quiz"],
) => {
  const { lessonPlan, previousOutput } = context;
  const userRequest = context.refinement
    ?.map((r) => (r.type === "custom" ? r.payload : refinementMap[r.type]))
    .join("\n");
  return `Modify the following exit quiz based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${userRequest}

Adapt the quiz to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
  `;
};

export const buildExitQuizSystemMessage = () => {
  return getQuizSystemMessage("exit");
};
