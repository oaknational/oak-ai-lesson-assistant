import { z } from "zod";

export const modelArmorCredentialsSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

export const modelArmorRequestSchema = z.object({
  userPromptData: z.object({
    text: z.string(),
  }),
});

export const rangeInfoSchema = z
  .object({
    start: z.string().optional(),
    end: z.string().optional(),
  })
  .passthrough();

export const messageItemSchema = z
  .object({
    messageType: z.string().optional(),
    message: z.string(),
  })
  .passthrough();

export const piAndJailbreakFilterResultSchema = z
  .object({
    executionState: z.string().optional(),
    messageItems: z.array(messageItemSchema).optional(),
    matchState: z.string().optional(),
    confidenceLevel: z.string().optional(),
  })
  .passthrough();

export const sdpFindingSchema = z
  .object({
    infoType: z.string(),
    likelihood: z.string().optional(),
    location: z
      .object({
        byteRange: rangeInfoSchema.optional(),
        codepointRange: rangeInfoSchema.optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const sdpInspectResultSchema = z
  .object({
    executionState: z.string().optional(),
    messageItems: z.array(messageItemSchema).optional(),
    matchState: z.string().optional(),
    findings: z.array(sdpFindingSchema).optional(),
    findingsTruncated: z.boolean().optional(),
  })
  .passthrough();

export const sdpFilterResultSchema = z
  .object({
    inspectResult: sdpInspectResultSchema.optional(),
  })
  .passthrough();

export const maliciousUriMatchedItemSchema = z
  .object({
    uri: z.string(),
    locations: z.array(rangeInfoSchema).optional(),
  })
  .passthrough();

export const maliciousUriFilterResultSchema = z
  .object({
    executionState: z.string().optional(),
    messageItems: z.array(messageItemSchema).optional(),
    matchState: z.string().optional(),
    maliciousUriMatchedItems: z.array(maliciousUriMatchedItemSchema).optional(),
  })
  .passthrough();

export const csamFilterResultSchema = z
  .object({
    executionState: z.string().optional(),
    matchState: z.string().optional(),
  })
  .passthrough();

export const raiFilterResultSchema = z
  .object({
    executionState: z.string().optional(),
    matchState: z.string().optional(),
  })
  .passthrough();

export const modelArmorFilterResultsSchema = z
  .object({
    csam: z
      .object({
        csamFilterFilterResult: csamFilterResultSchema.optional(),
      })
      .passthrough()
      .optional(),
    pi_and_jailbreak: z
      .object({
        piAndJailbreakFilterResult: piAndJailbreakFilterResultSchema.optional(),
      })
      .passthrough()
      .optional(),
    rai: z
      .object({
        raiFilterResult: raiFilterResultSchema.optional(),
      })
      .passthrough()
      .optional(),
    sdp: z
      .object({
        sdpFilterResult: sdpFilterResultSchema.optional(),
      })
      .passthrough()
      .optional(),
    malicious_uris: z
      .object({
        maliciousUriFilterResult: maliciousUriFilterResultSchema.optional(),
      })
      .passthrough()
      .optional(),
  })
  .catchall(z.unknown());

export const modelArmorSanitizationResultSchema = z
  .object({
    filterMatchState: z.string(),
    invocationResult: z.string().optional(),
    filterResults: modelArmorFilterResultsSchema.optional(),
    sanitizationMetadata: z.record(z.unknown()).optional(),
  })
  .passthrough();

export const modelArmorSanitizationResponseSchema = z
  .object({
    sanitizationResult: modelArmorSanitizationResultSchema,
  })
  .passthrough();

export type RangeInfo = z.infer<typeof rangeInfoSchema>;
export type MessageItem = z.infer<typeof messageItemSchema>;
export type SdpFinding = z.infer<typeof sdpFindingSchema>;
export type ModelArmorSanitizationResponse = z.infer<
  typeof modelArmorSanitizationResponseSchema
>;
