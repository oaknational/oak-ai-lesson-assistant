import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

// Per-agent model params are passed via agent.modelParams
import type { GenericPromptAgent } from "../schema";
import type { WithError } from "../types";

export async function executeGenericPromptAgent<ResponseType>({
  agent,
  openai,
}: {
  agent: GenericPromptAgent<ResponseType>;
  openai: OpenAI;
}): Promise<WithError<ResponseType>> {
  const schemaWrapped = z.object({
    value: agent.responseSchema,
  });
  const responseFormat = zodTextFormat(schemaWrapped, `agent_response_schema`);

  const result = await openai.responses.parse({
    input: agent.input,
    stream: false,
    ...agent.modelParams,
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
    return {
      error: {
        message: "An unknown error occurred\n\n" + JSON.stringify(result),
      },
    };
  }

  return { error: null, data: result.output_parsed.value };
}
