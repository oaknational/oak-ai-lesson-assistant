import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import type { z } from "zod";

type WithError<T> = { error: null; data: T } | { error: string };

export async function callLLM<ResponseType>({
  systemPrompt,
  userPrompt,
  responseSchema,
  openAIClient,
  model,
}: {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: z.ZodType<ResponseType>;
  openAIClient: OpenAI;
  model: string; // TODO type this properly
}): Promise<WithError<ResponseType>> {
  const responseFormat = zodTextFormat(responseSchema, `agent_response_schema`);

  const result = await openAIClient.responses.parse({
    instructions: systemPrompt,
    input: userPrompt,
    stream: false,
    model,
    text: {
      format: responseFormat,
    },
  });

  if (
    result.output[0]?.type === "message" &&
    result.output[0]?.content[0]?.type === "refusal"
  ) {
    return { error: result.output[0]?.content[0]?.refusal };
  }

  if (!result.output_parsed) {
    // TODO log error
    return { error: "An unknown error occurred" };
  }

  return { error: null, data: result.output_parsed };
}
