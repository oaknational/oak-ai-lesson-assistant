import { lessonPlanPromptParts } from "./lessonPromptParts";
import type { PartialLessonPlanFieldKeys } from "./schema";

export const buildPartialLessonSystemMessage = ({
  lessonParts,
}: {
  lessonParts: PartialLessonPlanFieldKeys[] | [];
}) => {
  let prompt = `You are an expert teacher in the UK. You are going to help me write a lesson plan for a class of pupils. 
  The lesson plan should be structured and include all the following parts and should match the given schema:
  `;
  lessonParts.forEach((part) => {
    prompt += `\n ${lessonPlanPromptParts[part]}`;
  });
  return prompt;
};

export const buildPartialLessonPrompt = ({
  subject,
  keyStage,
  title,
}: {
  subject: string;
  keyStage: string;
  title: string;
}) => {
  return `Create parts of a lesson plan for a uk school, subject: ${subject}, key stage: ${keyStage}, title: ${title}`;
};
