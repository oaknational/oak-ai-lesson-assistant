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
      model: openai("gpt-4o"),
      system: systemMessage,
    });

    const parsedObject = schema.safeParse(object);
    if (!parsedObject.success) {
      console.log("Error in getLLMGeneration", parsedObject.error);
      throw new Error(
        `Context schema validation failed: ${JSON.stringify(parsedObject.error.issues, null, 2)}`,
      );
    }
    return parsedObject.data;
  },
};
