import { openai } from "@ai-sdk/openai";
import { type Schema, generateObject } from "ai";
import type { ZodSchema } from "zod/v3";

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
      // The AI SDK's zod overload references z.ZodTypeDef, removed in Zod 4, so
      // it no longer matches a Zod 3 schema. Cast to the SDK's own Schema<T>
      // union branch instead; at runtime the SDK accepts the zod schema as-is.
      schema: schema as unknown as Schema<T>,
      model: openai("gpt-4o"),
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
