import { z } from "zod";

export const threatSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);
export type ThreatSeverity = z.infer<typeof threatSeveritySchema>;

export const threatCategorySchema = z.enum([
  "ascii_smuggling",
  "prompt_injection",
  "system_prompt_override",
  "prompt_extraction",
  "malicious_code",
  "shell_injection",
  "sql_injection",
  "rag_exfiltration",
  "pii",
  "other",
]);
export type ThreatCategory = z.infer<typeof threatCategorySchema>;

export const threatDetectionMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});
export type ThreatDetectionMessage = z.infer<
  typeof threatDetectionMessageSchema
>;

export const threatFindingSchema = z.object({
  category: threatCategorySchema,
  severity: threatSeveritySchema,
  providerCode: z.string(),
  detected: z.boolean(),
  snippet: z.string().optional(),
  start: z.number().optional(),
  end: z.number().optional(),
  confidence: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ThreatFinding = z.infer<typeof threatFindingSchema>;

export const threatDetectionDetailsSchema = z
  .object({
    detectedElements: z.array(z.string()).optional(),
    confidence: z.number().optional(),
    recommendedAction: z.string().optional(),
  })
  .optional();

export const threatDetectionResultSchema = z.object({
  provider: z.string().min(1),
  isThreat: z.boolean(),
  severity: threatSeveritySchema.optional(),
  category: threatCategorySchema.optional(),
  message: z.string(),
  rawResponse: z.unknown().optional(),
  requestId: z.string().optional(),
  findings: z.array(threatFindingSchema),
  details: threatDetectionDetailsSchema,
});
export type ThreatDetectionResult = z.infer<typeof threatDetectionResultSchema>;
