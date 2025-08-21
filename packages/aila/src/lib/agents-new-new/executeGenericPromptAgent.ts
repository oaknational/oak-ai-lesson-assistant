import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

import type { GenericPromptAgentPrompt } from "./schema";
import type { WithError } from "./types";

export async function executeGenericPromptAgent<ResponseType>({
  agent,
  openai,
}: {
  agent: GenericPromptAgentPrompt<ResponseType>;
  openai: OpenAI;
}): Promise<WithError<ResponseType>> {
  console.log("⏳ Executing agent");
  const schemaWrapped = z.object({
    value: agent.responseSchema,
  });
  const responseFormat = zodTextFormat(schemaWrapped, `agent_response_schema`);

  const result = await openai.responses.parse({
    input: agent.input,
    stream: false,
    model: "gpt-4o-2024-11-20",
    text: {
      format: responseFormat,
    },
  });

  if (
    result.output[0]?.type === "message" &&
    result.output[0]?.content[0]?.type === "refusal"
  ) {
    console.log("❌ Agent refused to answer");
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

  console.log("✅", result.output_text);

  return { error: null, data: result.output_parsed.value };
}
