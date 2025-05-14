import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { moderationPrompt } from "./moderationPrompt";

export const fetchAdditionalMaterialModeration = async (input: string) => {
  const { text } = await generateText({
    system: moderationPrompt,
    prompt: input,
    model: openai("gpt-4-turbo"),
  });

  return text;
};
