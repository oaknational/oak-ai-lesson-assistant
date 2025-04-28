import { createOpenAIClient } from "@oakai/core/src/llm/openai";

import { zodResponseFormat } from "openai/helpers/zod.mjs";
import type { LooseLessonPlan } from "protocol/schema";
import { z } from "zod";

const _agentsSchema = z.union([
  z.object({
    name: z.literal("main_prompt"),
  }),
  z.object({
    name: z.literal("maths_quiz_recommender"),
  }),
]);

type Agents = z.infer<typeof _agentsSchema>;

export async function selectAgent({
  chatId,
  userId,
  document,
  userMessage,
}: {
  chatId: string;
  userId: string;
  document: LooseLessonPlan;
  userMessage: string;
}): Promise<Agents> {
  const openAIClient = createOpenAIClient({
    app: "lesson-assistant",
    chatMeta: {
      chatId,
      userId,
    },
  });

  const responseFormat = zodResponseFormat(z.object({}), "lesson_plan");

  const result = await openAIClient.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `### Role

You are UK Curriculum expert, who also happens to be an incredibly skilled UX designer and empath. 

### Task

The user is creating a document. It is using a tool for doing so.

Your job is to decide which agent should process the next task.

You will be given a partial document (in JSON format) and the user's last message and you must decide from the following agents:
- maths_quiz_recommender
  - only suggest this agent if the next appropriate task is the generation of a starter or exit quiz, and if the lesson's subject is maths/math/mathematics
  - if you select this agent, a quiz will be generated, and no other parts of the lesson will be affected
- main_prompt  
  - if the maths_quiz_recommender is not applicable, then select this agent

### User message

${userMessage}


### Document

${JSON.stringify(document)}
        `,
      },
    ],
    stream: false,
    model: "gpt-4o-2024-08-06",
    response_format: responseFormat,
  });

  console.log(result.choices[0]?.message);

  return { name: "main_prompt" };
}
