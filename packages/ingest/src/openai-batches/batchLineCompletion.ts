import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export function getLessonPlanBatchFileLine({
  lineId,
  systemPrompt,
  userPrompt,
  responseSchema,
  responseSchemaName,
}: {
  lineId: string;
  systemPrompt: string;
  userPrompt: string;
  responseSchema: z.Schema;
  responseSchemaName: string;
}) {
  return {
    custom_id: lineId,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(responseSchema, responseSchemaName),
    },
  };
}
