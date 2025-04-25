import { aiLogger } from "@oakai/logger";

import { z } from "zod";

const log = aiLogger("additional-materials-threat-detection");

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

export const lakeraGuardRequestSchema = z.object({
  messages: z.array(messageSchema),
  project_id: z.string().optional(),
  payload: z.boolean().optional(),
  breakdown: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  dev_info: z.boolean().optional(),
});

export const lakeraGuardResponseSchema = z.object({
  flagged: z.boolean(),
  payload: z.array(z.unknown()),
  metadata: z.object({
    request_uuid: z.string(),
  }),
  breakdown: z.array(
    z.object({
      project_id: z.string(),
      policy_id: z.string(),
      detector_id: z.string(),
      detector_type: z.string(),
      detected: z.boolean(),
      message_id: z.number(),
    }),
  ),
});

export async function performLakeraThreatCheck({
  messages,
  projectId = process.env.LAKERA_GUARD_PROJECT_ID,
  apiKey = process.env.LAKERA_GUARD_API_KEY,
}: {
  messages: Message[];
  projectId?: string;
  apiKey?: string;
}): Promise<z.infer<typeof lakeraGuardResponseSchema>> {
  if (!apiKey) {
    log.error("Lakera API key not found");
    throw new Error("Lakera API key not found");
  }

  const requestBody = {
    messages,
    ...(projectId && { project_id: projectId }),
    payload: true,
    breakdown: true,
  };

  const parsedBody = lakeraGuardRequestSchema.parse(requestBody);

  const response = await fetch("https://api.lakera.ai/v2/guard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(parsedBody),
  });

  const responseData = await response.json();

  const parsed = lakeraGuardResponseSchema.parse(responseData);

  log.info("Lakera API response", {
    parsed,
    status: response.status,
  });

  return parsed;
}
