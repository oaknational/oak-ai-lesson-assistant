import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { ZodSchema } from "zod";

export const OpenAIProvider = {
  async generateObject<T>({
    prompt,
    schema,
    systemMessage,
  }: {
    prompt: string;
    schema: ZodSchema<T>;
    systemMessage?: string;
  }): Promise<T> {
    const { object } = await generateObject({
      prompt,
      schema,
      model: openai("gpt-4-turbo"),
      system: systemMessage,
    });
    return schema.parse(object);
  },
};
