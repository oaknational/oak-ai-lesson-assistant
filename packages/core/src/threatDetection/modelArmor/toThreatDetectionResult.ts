import type {
  ThreatCategory,
  ThreatDetectionResult,
  ThreatFinding,
} from "../types";
import type { ModelArmorSanitizeUserPromptResponse } from "./schema";

const PI_AND_JAILBREAK_CATEGORY_RULES: Array<{
  keywords: string[];
  category: ThreatCategory;
}> = [
  { keywords: ["prompt injection"], category: "prompt_injection" },
  { keywords: ["prompt extraction"], category: "prompt_extraction" },
  { keywords: ["exfiltration"], category: "rag_exfiltration" },
  { keywords: ["pii"], category: "pii" },
  { keywords: ["sensitive data"], category: "pii" },
  { keywords: ["jailbreak"], category: "system_prompt_override" },
  { keywords: ["system prompt"], category: "system_prompt_override" },
];

const SDP_INFO_TYPE_CATEGORY_RULES: Array<{
  keywords: string[];
  category: ThreatCategory;
}> = [
  { keywords: ["prompt", "extract"], category: "prompt_extraction" },
  { keywords: ["exfiltration"], category: "rag_exfiltration" },
  { keywords: ["sensitive"], category: "rag_exfiltration" },
];

function matchThreatCategoryFromKeywords(
  value: string,
  rules: Array<{ keywords: string[]; category: ThreatCategory }>,
  fallbackCategory: ThreatCategory,
): ThreatCategory {
  const matchingRule = rules.find((rule) =>
    rule.keywords.every((keyword) => value.includes(keyword)),
  );

  return matchingRule?.category ?? fallbackCategory;
}

function mapPiAndJailbreakMessagesToCategory(messages: string[]): ThreatCategory {
  return matchThreatCategoryFromKeywords(
    messages.join(" ").toLowerCase(),
    PI_AND_JAILBREAK_CATEGORY_RULES,
    "system_prompt_override",
  );
}

function mapSdpInfoTypeToThreatCategory(infoType: string): ThreatCategory {
  return matchThreatCategoryFromKeywords(
    infoType.toLowerCase(),
    SDP_INFO_TYPE_CATEGORY_RULES,
    "pii",
  );
}

function mapPiAndJailbreakConfidenceLevelToConfidence(
  confidenceLevel?: string,
): number | undefined {
  switch (confidenceLevel) {
    case "LOW":
      return 0.3;
    case "MEDIUM":
      return 0.6;
    case "HIGH":
      return 0.9;
    default:
      return undefined;
  }
}

function mapSdpLikelihoodToConfidence(likelihood?: string): number | undefined {
  switch (likelihood) {
    case "VERY_UNLIKELY":
      return 0.1;
    case "UNLIKELY":
      return 0.25;
    case "POSSIBLE":
      return 0.5;
    case "LIKELY":
      return 0.75;
    case "VERY_LIKELY":
      return 0.95;
    default:
      return undefined;
  }
}

function parseOffset(value?: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getHighestThreat(findings: ThreatFinding[]): ThreatFinding | undefined {
  const severityOrder = ["low", "medium", "high", "critical"];

  return findings.reduce<ThreatFinding | undefined>((highest, current) => {
    if (!current.detected) {
      return highest;
    }

    if (!highest) {
      return current;
    }

    return severityOrder.indexOf(current.severity) >
      severityOrder.indexOf(highest.severity)
      ? current
      : highest;
  }, undefined);
}

function extractFindings(
  data: ModelArmorSanitizeUserPromptResponse,
  prompt: string,
): ThreatFinding[] {
  const findings: ThreatFinding[] = [];
  const { filterResults } = data.sanitizationResult;

  const piAndJailbreakResult =
    filterResults.piAndJailbreak?.piAndJailbreakFilterResult;
  if (piAndJailbreakResult?.matchState === "MATCH_FOUND") {
    findings.push({
      category: mapPiAndJailbreakMessagesToCategory(
        piAndJailbreakResult.messageItems?.map((item) => item.message) ?? [],
      ),
      severity: "critical",
      providerCode: "pi_and_jailbreak",
      detected: true,
      confidence: mapPiAndJailbreakConfidenceLevelToConfidence(
        piAndJailbreakResult.confidenceLevel,
      ),
      metadata: {
        confidenceLevel: piAndJailbreakResult.confidenceLevel,
        executionState: piAndJailbreakResult.executionState,
        messageItems: piAndJailbreakResult.messageItems,
      },
    });
  }

  const sdpFindings = filterResults.sdp?.sdpFilterResult?.inspectResult?.findings;
  for (const finding of sdpFindings ?? []) {
    const codepointRange = finding.location?.codepointRange;
    const start = parseOffset(codepointRange?.start);
    const end = parseOffset(codepointRange?.end);

    findings.push({
      category: mapSdpInfoTypeToThreatCategory(finding.infoType),
      severity: "high",
      providerCode: finding.infoType,
      detected: true,
      snippet:
        start !== undefined && end !== undefined
          ? prompt.slice(start, end)
          : undefined,
      start,
      end,
      confidence: mapSdpLikelihoodToConfidence(finding.likelihood),
      metadata: {
        likelihood: finding.likelihood,
        location: finding.location,
      },
    });
  }

  const maliciousUris =
    filterResults.maliciousUri?.maliciousUriFilterResult?.maliciousUriMatchedItems;
  for (const maliciousUri of maliciousUris ?? []) {
    const location = maliciousUri.locations?.[0];
    findings.push({
      category: "malicious_code",
      severity: "high",
      providerCode: "malicious_uri",
      detected: true,
      snippet: maliciousUri.uri,
      start: parseOffset(location?.start),
      end: parseOffset(location?.end),
      metadata: {
        uri: maliciousUri.uri,
        locations: maliciousUri.locations,
      },
    });
  }

  if (
    findings.length === 0 &&
    data.sanitizationResult.filterMatchState === "MATCH_FOUND"
  ) {
    findings.push({
      category: "other",
      severity: "high",
      providerCode: "model_armor_match",
      detected: true,
      metadata: {
        invocationResult: data.sanitizationResult.invocationResult,
        filterResults: data.sanitizationResult.filterResults,
        sanitizationMetadata: data.sanitizationResult.sanitizationMetadata,
      },
    });
  }

  return findings;
}

export function toModelArmorThreatDetectionResult(
  data: ModelArmorSanitizeUserPromptResponse,
  prompt: string,
): ThreatDetectionResult {
  const findings = extractFindings(data, prompt);
  const highestThreat = getHighestThreat(findings);
  const isThreat = data.sanitizationResult.filterMatchState === "MATCH_FOUND";
  const detectedElements = findings
    .filter((finding) => finding.detected)
    .map((finding) => finding.snippet ?? finding.providerCode);

  return {
    provider: "model_armor",
    isThreat,
    severity: highestThreat?.severity,
    category: highestThreat?.category,
    message: isThreat ? "Potential threat detected" : "No threats detected",
    rawResponse: data.rawResponse,
    requestId: data.requestId,
    findings,
    details: detectedElements.length > 0 ? { detectedElements } : {},
  };
}
