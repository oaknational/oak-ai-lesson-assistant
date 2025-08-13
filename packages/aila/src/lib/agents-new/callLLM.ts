import fs from "node:fs";
import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

import type { errorSchema } from "./agentRegistry";

type WithError<T> =
  | { error: null; data: T }
  | { error: z.infer<typeof errorSchema> };

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
  const schemaWrapped = z.object({
    value: responseSchema,
  });
  const responseFormat = zodTextFormat(schemaWrapped, `agent_response_schema`);

  fs.writeFileSync(`./${Date.now()}_systemPrompt.log`, systemPrompt);
  fs.writeFileSync(`./${Date.now()}_userPrompt.log`, userPrompt);

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
    return { error: { message: result.output[0]?.content[0]?.refusal } };
  }

  if (!result.output_parsed || result.output_parsed.value === undefined) {
    // TODO log error
    return {
      error: {
        message: "An unknown error occurred\n\n" + JSON.stringify(result),
      },
    };
  }

  return { error: null, data: result.output_parsed.value };
}
