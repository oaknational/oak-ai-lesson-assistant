import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export const lakeraGuardRequestSchema = z.object({
  messages: z.array(messageSchema),
  project_id: z.string().optional(),
  payload: z.boolean().optional(),
  breakdown: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  dev_info: z.boolean().optional(),
});

const payloadItemSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
  detector_type: z.string(),
  labels: z.array(z.string()).optional(), // Only present for custom regex matches
});

const breakdownItemSchema = z.object({
  project_id: z.string(),
  policy_id: z.string(),
  detector_id: z.string(),
  detector_type: z.string(),
  detected: z.boolean(),
});

// Dev info schema
const devInfoSchema = z.object({
  git_revision: z.string().length(8), // First 8 characters of commit hash
  git_timestamp: z.string().datetime({ offset: true }), // ISO 8601 format
  model_version: z.literal("lakera-guard-1"), // Currently always this value
  version: z.string(), // Semantic version string
});

// Response Schema
export const lakeraGuardResponseSchema = z.object({
  flagged: z.boolean(),
  payload: z.array(payloadItemSchema).optional(),
  breakdown: z.array(breakdownItemSchema).optional(),
  dev_info: devInfoSchema.optional(),
});

// Results endpoint schema
const lakeraResultItemSchema = z.object({
  project_id: z.string(),
  policy_id: z.string(),
  detector_id: z.string(),
  detector_type: z.string(),
  result: z.enum(["l1_confident", "l2_very_likely", "l3_likely", "l4_less_likely", "l5_unlikely"]),
  custom_matched: z.boolean(),
  message_id: z.number(),
});

export const lakeraResultsResponseSchema = z.object({
  results: z.array(lakeraResultItemSchema),
});

// Type definitions
export type LakeraGuardRequest = z.infer<typeof lakeraGuardRequestSchema>;
export type LakeraGuardResponse = z.infer<typeof lakeraGuardResponseSchema>;
export type LakeraResultsResponse = z.infer<typeof lakeraResultsResponseSchema>;
export type LakeraResultItem = z.infer<typeof lakeraResultItemSchema>;
export type Message = z.infer<typeof messageSchema>;
export type PayloadItem = z.infer<typeof payloadItemSchema>;
export type BreakdownItem = z.infer<typeof breakdownItemSchema>;
export type DevInfo = z.infer<typeof devInfoSchema>;
