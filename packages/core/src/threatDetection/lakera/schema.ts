import { z } from "zod";

/**
 * Schema for a message sent to Lakera Guard API
 */
const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

/**
 * Schema for the request body sent to Lakera Guard API
 */
export const lakeraGuardRequestSchema = z.object({
  messages: z.array(messageSchema),
  project_id: z.string().optional(),
  payload: z.boolean().optional(),
  breakdown: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  dev_info: z.boolean().optional(),
});

/**
 * Schema for a payload item in the Lakera Guard response
 * Contains the detected text and its position
 */
const payloadItemSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
  detector_type: z.string(),
  labels: z.array(z.string()).optional(), // Only present for custom regex matches
});

/**
 * Schema for a breakdown item in the Lakera Guard response
 * Provides details about each detector that ran
 */
const breakdownItemSchema = z.object({
  project_id: z.string(),
  policy_id: z.string(),
  detector_id: z.string(),
  detector_type: z.string(),
  detected: z.boolean(),
});

/**
 * Schema for development info in the Lakera Guard response
 * Provides version and build information about the Lakera Guard service
 */
const devInfoSchema = z.object({
  git_revision: z.string().length(8), // First 8 characters of commit hash
  git_timestamp: z.string().datetime({ offset: true }), // ISO 8601 format
  model_version: z.literal("lakera-guard-1"), // Currently always this value
  version: z.string(), // Semantic version string
});

/**
 * Schema for the response from Lakera Guard API
 */
export const lakeraGuardResponseSchema = z.object({
  flagged: z.boolean(),
  payload: z.array(payloadItemSchema).optional(),
  breakdown: z.array(breakdownItemSchema).optional(),
  dev_info: devInfoSchema.optional(),
  metadata: z
    .object({
      request_uuid: z.string(),
    })
    .optional(),
});

// Type definitions
export type LakeraGuardRequest = z.infer<typeof lakeraGuardRequestSchema>;
export type LakeraGuardResponse = z.infer<typeof lakeraGuardResponseSchema>;
export type Message = z.infer<typeof messageSchema>;
export type PayloadItem = z.infer<typeof payloadItemSchema>;
export type BreakdownItem = z.infer<typeof breakdownItemSchema>;
export type DevInfo = z.infer<typeof devInfoSchema>;
