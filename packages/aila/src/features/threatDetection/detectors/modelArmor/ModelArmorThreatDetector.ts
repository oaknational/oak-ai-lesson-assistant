import {
  ModelArmorClient,
  type ModelArmorSanitizeUserPromptResponse,
} from "@oakai/core/src/threatDetection/modelArmor";
import { threatDetectionMessageSchema } from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import {
  AilaThreatDetector,
  type ThreatFinding,
  type ThreatCategory,
  type ThreatDetectionResult,
  type ThreatSeverity,
} from "../AilaThreatDetector";

const log = aiLogger("aila:threat");

type ThreatMessage = z.infer<typeof threatDetectionMessageSchema>;

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

export class ModelArmorThreatDetector extends AilaThreatDetector {
  private readonly modelArmorClient: ModelArmorClient;

  constructor() {
    super();

    const credentialsJson = process.env.GOOGLE_EXTERNAL_ACCOUNT_CREDENTIALS_JSON;
    const projectId = process.env.MODEL_ARMOR_PROJECT_ID;
    const location = process.env.MODEL_ARMOR_LOCATION;
    const templateId = process.env.MODEL_ARMOR_TEMPLATE_ID;
    const apiBaseUrl = process.env.MODEL_ARMOR_API_BASE_URL;

    if (!credentialsJson) {
      throw new Error(
        "GOOGLE_EXTERNAL_ACCOUNT_CREDENTIALS_JSON environment variable not set",
      );
    }

    if (!projectId) {
      throw new Error("MODEL_ARMOR_PROJECT_ID environment variable not set");
    }

    if (!location) {
      throw new Error("MODEL_ARMOR_LOCATION environment variable not set");
    }

    if (!templateId) {
      throw new Error("MODEL_ARMOR_TEMPLATE_ID environment variable not set");
    }

    this.modelArmorClient = new ModelArmorClient({
      credentialsJson,
      projectId,
      location,
      templateId,
      apiBaseUrl,
    });
  }

  protected async authenticate(): Promise<void> {
    return Promise.resolve();
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    log.info("Detecting threat with Model Armor", {
      contentType: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 0,
    });

    if (
      !Array.isArray(content) ||
      !content.every((message) => this.isThreatMessage(message))
    ) {
      log.error("Invalid input format for Model Armor", { content });
      throw new Error("Input must be an array of Messages");
    }

    const extractedMessages = extractPromptTextFromMessages(content);
    const prompt = this.buildPrompt(extractedMessages);
    const data = await this.modelArmorClient.sanitizeUserPrompt(prompt);
    const findings = this.extractFindings(data, prompt);
    const highestThreat = this.getHighestThreat(findings);
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

  async isThreatError(): Promise<boolean> {
    return Promise.resolve(false);
  }

  private buildPrompt(messages: ThreatMessage[]): string {
    return messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");
  }

  private extractFindings(
    data: ModelArmorSanitizeUserPromptResponse,
    prompt: string,
  ): ThreatFinding[] {
    const findings: ThreatFinding[] = [];
    const { filterResults } = data.sanitizationResult;

    const piAndJailbreakResult =
      filterResults.piAndJailbreak?.piAndJailbreakFilterResult;
    if (piAndJailbreakResult?.matchState === "MATCH_FOUND") {
      const category = this.mapPiAndJailbreakMessagesToCategory(
        piAndJailbreakResult.messageItems?.map((item) => item.message) ?? [],
      );

      findings.push({
        category,
        severity: "critical",
        providerCode: "pi_and_jailbreak",
        detected: true,
        confidence: this.mapPiAndJailbreakConfidenceLevelToConfidence(
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
      const start = this.parseOffset(codepointRange?.start);
      const end = this.parseOffset(codepointRange?.end);

      findings.push({
        category: this.mapSdpInfoTypeToThreatCategory(finding.infoType),
        severity: "high",
        providerCode: finding.infoType,
        detected: true,
        snippet:
          start !== undefined && end !== undefined
            ? prompt.slice(start, end)
            : undefined,
        start,
        end,
        confidence: this.mapSdpLikelihoodToConfidence(finding.likelihood),
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
        start: this.parseOffset(location?.start),
        end: this.parseOffset(location?.end),
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

  private getHighestThreat(
    findings: ThreatFinding[],
  ): ThreatFinding | undefined {
    return findings.reduce<ThreatFinding | undefined>(
      (highest, current) => {
        if (!current.detected) return highest;
        if (!highest) return current;

        return this.compareSeverity(current.severity, highest.severity) > 0
          ? current
          : highest;
      },
      undefined,
    );
  }

  private mapPiAndJailbreakMessagesToCategory(
    messages: string[],
  ): ThreatCategory {
    return this.matchThreatCategoryFromKeywords(
      messages.join(" ").toLowerCase(),
      PI_AND_JAILBREAK_CATEGORY_RULES,
      "system_prompt_override",
    );
  }

  private mapSdpInfoTypeToThreatCategory(infoType: string): ThreatCategory {
    return this.matchThreatCategoryFromKeywords(
      infoType.toLowerCase(),
      SDP_INFO_TYPE_CATEGORY_RULES,
      "pii",
    );
  }

  private mapPiAndJailbreakConfidenceLevelToConfidence(
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

  private mapSdpLikelihoodToConfidence(
    likelihood?: string,
  ): number | undefined {
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

  private matchThreatCategoryFromKeywords(
    value: string,
    rules: Array<{ keywords: string[]; category: ThreatCategory }>,
    fallbackCategory: ThreatCategory,
  ): ThreatCategory {
    const matchingRule = rules.find((rule) =>
      rule.keywords.every((keyword) => value.includes(keyword)),
    );

    return matchingRule?.category ?? fallbackCategory;
  }

  private parseOffset(value?: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private isThreatMessage(message: unknown): message is ThreatMessage {
    return threatDetectionMessageSchema.safeParse(message).success;
  }
}
