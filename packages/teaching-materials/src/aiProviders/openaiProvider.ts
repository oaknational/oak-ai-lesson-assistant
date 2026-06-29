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
      model: openai("gpt-5.4-2026-03-05"),
      system: systemMessage,
      mode: "json",
    });

    const parsedObject = schema.safeParse(object);
    if (!parsedObject.success) {
      throw new Error(
        `Context schema validation failed: ${JSON.stringify(parsedObject.error.issues, null, 2)}`,
      );
    }
    return parsedObject.data;
  },
};
