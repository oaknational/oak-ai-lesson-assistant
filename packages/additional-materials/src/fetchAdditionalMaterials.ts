import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import type { ZodSchema } from "zod";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import { schema } from "../../core/src/prompts/lesson-assistant/parts";
import { comprehensionTaskSchema } from "./schema/comprehensionTask";
import { homeworkMaterialSchema } from "./schema/homework";
import { schemaMap, type SchemaMapType } from "./schemas";

function getSchema(action: SchemaMapType): ZodSchema {
  const schema = schemaMap[action];
  if (!schema) {
    throw new Error(`No schema found for action: ${action}`);
  }
  return schema;
}

const generatePrompt = (lessonPlan: LooseLessonPlan, action: string) => {
  switch (action) {
    case "additional-homework":
      return {
        prompt: `Generate a homework task for the lesson: "${lessonPlan.title}" with key learning points: "${lessonPlan.keyLearningPoints}"`,
        systemMessage:
          "You are generating homework tasks. Ensure the task is clear, subject-specific, and appropriate for students. Keep questions engaging and relevant. Respond to the user in Markdown format.",
        schema: homeworkMaterialSchema,
      };

    case "additional-comprehension":
      return {
        prompt: `Create a comprehension task for the lesson: "${lessonPlan.title}" focusing on key learning points: "${lessonPlan.keyLearningPoints}". Ensure the task assesses students' understanding effectively.`,
        systemMessage:
          "You are generating a comprehension task. Make it subject-specific, engaging, and appropriately challenging for students.",
        schema: comprehensionTaskSchema,
      };

    default:
      throw new Error(`Action "${action}" is not supported.`);
  }
};

export const fetchAdditionalMaterials = async ({
  lessonPlan,
  userMessage,
  action,
}: {
  lessonPlan: LooseLessonPlan;
  userMessage: string;
  action: SchemaMapType;
}) => {
  const generationProps = generatePrompt(lessonPlan, action);

  console.log("acton", action);

  const { object } = await generateObject({
    prompt: generationProps.prompt,
    schema: getSchema(action),
    model: openai("gpt-4-turbo"),
    system: generationProps.systemMessage,
  });

  console.log("TEXT", object);

  return object;

  // return {
  //   type: "patch",
  //   reasoning: text.reasoning,
  //   value: {
  //     type: "string",
  //     op: "add",
  //     path: "/additionalMaterials",
  //     value: text.text,
  //   },
  // };
};

// export const createHomework = async (prompt: string) => {
//   const { object } = await generateObject({
//     model: openai("gpt-4-turbo"),
//     schema: HomeworkTaskSchema,
//     prompt,
//     system:
//       `You are a teacher helping a user (another teacher) create a homework task. You will be given a list of key learning points to base the homework on` +
//       `Use British English`,
//   });

//   return object.homework;
// };
