import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, type CoreMessage } from "ai";
import type { ZodSchema } from "zod";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import { schema } from "../../core/src/prompts/lesson-assistant/parts";
import {
  additionalHomeworkPrompt,
  additionalHomeworkSystemPrompt,
} from "./prompts/prompt";
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

const getPrompt = (lessonPlan: LooseLessonPlan, action: string) => {
  switch (action) {
    case "additional-homework":
      return {
        prompt: additionalHomeworkPrompt(lessonPlan),
        systemMessage: additionalHomeworkSystemPrompt(),
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
  userMessages,
  action,
}: {
  lessonPlan: LooseLessonPlan;
  userMessages: Array<CoreMessage>;
  action: SchemaMapType;
}) => {
  const generationProps = getPrompt(lessonPlan, action);

  console.log("acton", action);

  const { object } = await generateObject({
    prompt: generationProps.prompt,
    schema: getSchema(action),
    model: openai("gpt-4-turbo"),
    system: generationProps.systemMessage,
    messages: userMessages,
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
