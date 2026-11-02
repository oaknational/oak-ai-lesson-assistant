import { openai } from "@ai-sdk/openai";
import { Output, asSchema, generateText } from "ai";
import type { ZodSchema } from "zod";

const model = openai.chat("gpt-4o");

/**
 * Strict structured outputs can't express every schema, such as one with
 * optional fields. JSON mode instead puts the schema in the instructions and
 * leaves validation to the caller, as the AI SDK did before v5
 */
async function generateJsonModeObject({
  prompt,
  schema,
  systemMessage,
}: {
  prompt: string;
  schema: ZodSchema;
  systemMessage?: string;
}) {
  const jsonSchema = await asSchema(schema).jsonSchema;
  const { output } = await generateText({
    prompt,
    output: Output.json(),
    model,
    instructions: [
      systemMessage,
      `JSON schema:\n${JSON.stringify(jsonSchema)}\nYou MUST answer with a JSON object that matches the JSON schema above.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  return output;
}

export const OpenAIProvider = {
  async generateObject<T>({
    prompt,
    schema,
    systemMessage,
    jsonMode = false,
  }: {
    prompt: string;
    schema: ZodSchema<T>;
    systemMessage?: string;
    jsonMode?: boolean;
  }): Promise<T> {
    const output = jsonMode
      ? await generateJsonModeObject({ prompt, schema, systemMessage })
      : (
          await generateText({
            prompt,
            output: Output.object({ schema }),
            model,
            instructions: systemMessage,
          })
        ).output;

    const parsedObject = schema.safeParse(output);
    if (!parsedObject.success) {
      throw new Error(
        `Context schema validation failed: ${JSON.stringify(parsedObject.error.issues, null, 2)}`,
      );
    }
    return parsedObject.data;
  },
};
