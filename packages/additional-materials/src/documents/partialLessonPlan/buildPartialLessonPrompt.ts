import { howToMakeAGoodQuiz, lessonPlanPromptParts } from "./lessonPromptParts";
import { type PartialLessonPlanFieldKeys } from "./schema";

export const buildPartialLessonPrompt = ({
  lessonParts,
  year,
}: {
  lessonParts: PartialLessonPlanFieldKeys[];
  year?: string;
}) => {
  let prompt = `Write a lesson plan for a class of pupils in the UK ${year ? `in year group ${year}.` : "."} 
  The lesson plan should be structured and include all the following parts and should match the given schema: `;
  lessonParts.forEach((part) => {
    prompt += `\n **${part}** ${lessonPlanPromptParts[part]}`;
  });
  if (lessonParts.includes("starterQuiz") || lessonParts.includes("exitQuiz")) {
    prompt += `\n ${howToMakeAGoodQuiz}`;
  }
  return prompt;
};

export const buildPartialLessonSystemMessage = ({
  subject,
  keyStage,
  title,
  year,
}: {
  subject: string;
  keyStage: string;
  title: string;
  year?: string;
}) => {
  return `You are an expert teacher in the UK. You are going to help me write a lesson plan for a class of pupils. 
   Subject: ${subject}, year group ${year}, key stage: ${keyStage}, title: ${title}. 
   Return the lesson plan in JSON format matching the given schema.`;
};
