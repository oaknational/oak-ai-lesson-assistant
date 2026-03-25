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

const rangeInfoSchema = z
  .object({
    start: z.string().optional(),
    end: z.string().optional(),
  })
  .passthrough();

const messageItemSchema = z
  .object({
    messageType: z.string().optional(),
    message: z.string(),
  })
  .passthrough();

const piAndJailbreakFilterResultSchema = z
  .object({
    executionState: z.string().optional(),
    messageItems: z.array(messageItemSchema).optional(),
    matchState: z.string().optional(),
    confidenceLevel: z.string().optional(),
  })
  .passthrough();

const sdpFindingSchema = z
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

const sdpInspectResultSchema = z
  .object({
    executionState: z.string().optional(),
    messageItems: z.array(messageItemSchema).optional(),
    matchState: z.string().optional(),
    findings: z.array(sdpFindingSchema).optional(),
    findingsTruncated: z.boolean().optional(),
  })
  .passthrough();

const sdpFilterResultSchema = z
  .object({
    inspectResult: sdpInspectResultSchema.optional(),
  })
  .passthrough();

const maliciousUriFilterResultSchema = z
  .object({
    executionState: z.string().optional(),
    messageItems: z.array(messageItemSchema).optional(),
    matchState: z.string().optional(),
    maliciousUriMatchedItems: z
      .array(
        z
          .object({
            uri: z.string(),
            locations: z.array(rangeInfoSchema).optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export const modelArmorFilterResultSchema = z
  .object({
    piAndJailbreakFilterResult: piAndJailbreakFilterResultSchema.optional(),
    sdpFilterResult: sdpFilterResultSchema.optional(),
    maliciousUriFilterResult: maliciousUriFilterResultSchema.optional(),
  })
  .passthrough();

const rawFilterResultsSchema = z.union([
  z.record(modelArmorFilterResultSchema),
  z.array(modelArmorFilterResultSchema),
]);

const rawSanitizationResultSchema = z
  .object({
    filterMatchState: z.string(),
    filterResults: rawFilterResultsSchema.optional(),
    invocationResult: z.string().optional(),
    sanitizationMetadata: z
      .object({
        errorCode: z.string().optional(),
        errorMessage: z.string().optional(),
        ignorePartialInvocationFailures: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const modelArmorSanitizeUserPromptResponseSchema = z
  .object({
    sanitizationResult: rawSanitizationResultSchema,
  })
  .passthrough();

export type ModelArmorFilterResult = z.infer<
  typeof modelArmorFilterResultSchema
>;
export type ModelArmorSanitizeUserPromptApiResponse = z.infer<
  typeof modelArmorSanitizeUserPromptResponseSchema
>;

export type ModelArmorSanitizationResult = Omit<
  ModelArmorSanitizeUserPromptApiResponse["sanitizationResult"],
  "filterResults"
> & {
  filterResults: Record<string, ModelArmorFilterResult>;
};

export type ModelArmorSanitizeUserPromptResponse = {
  requestId?: string;
  sanitizationResult: ModelArmorSanitizationResult;
  rawResponse: ModelArmorSanitizeUserPromptApiResponse;
};

function normalizeFilterResultKey(key: string): string {
  switch (key) {
    case "pi_and_jailbreak":
      return "piAndJailbreak";
    case "malicious_uris":
      return "maliciousUri";
    default:
      return key;
  }
}

export function normalizeModelArmorFilterResults(
  filterResults: ModelArmorSanitizeUserPromptApiResponse["sanitizationResult"]["filterResults"],
): Record<string, ModelArmorFilterResult> {
  if (!filterResults) return {};

  if (!Array.isArray(filterResults)) {
    return Object.entries(filterResults).reduce<
      Record<string, ModelArmorFilterResult>
    >((results, [key, value]) => {
      results[normalizeFilterResultKey(key)] = value;
      return results;
    }, {});
  }

  return filterResults.reduce<Record<string, ModelArmorFilterResult>>(
    (results, filterResult, index) => {
      const key =
        Object.entries(filterResult)
          .find(([, value]) => value !== undefined)?.[0]
          ?.replace(/FilterResult$/u, "")
          ?.replace(/^([A-Z])/u, (match) => match.toLowerCase()) ??
        `filter_${index}`;

      results[normalizeFilterResultKey(key)] = filterResult;
      return results;
    },
    {},
  );
}
