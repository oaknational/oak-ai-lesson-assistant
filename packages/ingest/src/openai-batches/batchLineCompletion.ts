import { zodResponseFormat } from "openai/helpers/zod";

export function batchLineCompletion({
  customId,
  model,
  systemPrompt,
  userPrompt,
  responseFormat,
}: {
  customId: string;
  model: string;
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
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: responseFormat,
    },
  };
}
