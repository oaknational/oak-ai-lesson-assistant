import { z } from "zod";

export const threatSeveritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);
export type ThreatSeverity = z.infer<typeof threatSeveritySchema>;

// Establish this list of categories
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

export const threatDetectionResultSchema = z.object({
  isThreat: z.boolean(),
  severity: threatSeveritySchema.optional(),
  category: threatCategorySchema.optional(),
  message: z.string(),
  rawResponse: z.unknown().optional(),
  details: z
    .object({
      detectedElements: z.array(z.string()).optional(),
      confidence: z.number().optional(),
      recommendedAction: z.string().optional(),
    })
    .optional(),
});

export type ThreatDetectionResult = z.infer<typeof threatDetectionResultSchema>;

export abstract class AilaThreatDetector {
  protected abstract authenticate(): Promise<void>;

  abstract detectThreat(content: unknown): Promise<ThreatDetectionResult>;

  // Keep existing method for backward compatibility
  abstract isThreatError(error: unknown): Promise<boolean>;
}
