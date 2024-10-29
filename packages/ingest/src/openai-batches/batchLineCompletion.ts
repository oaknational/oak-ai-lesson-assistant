import type { zodResponseFormat } from "openai/helpers/zod";

export function batchLineCompletion({
  customId,
  model,
  temperature,
  systemPrompt,
  userPrompt,
  responseFormat,
}: {
  customId: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  userPrompt: string;
  responseFormat: ReturnType<typeof zodResponseFormat>;
}) {
  return {
    custom_id: customId,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: responseFormat,
    },
  };
}
