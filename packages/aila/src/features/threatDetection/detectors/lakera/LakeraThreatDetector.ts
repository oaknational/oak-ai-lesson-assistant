import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import {
  AilaThreatDetector,
  type ThreatCategory,
  type ThreatDetectionResult,
  type ThreatSeverity,
} from "../AilaThreatDetector";
import type { BreakdownItem, LakeraGuardResponse, Message } from "./schema";
import { lakeraGuardRequestSchema, lakeraGuardResponseSchema } from "./schema";

const log = aiLogger("aila:threat");

// Configuration for multiple Lakera detectors
interface LakeraDetectorConfig {
  projectId: string;
  name: string;
  recordPolicyViolation: boolean; // Whether to record policy violations for this detector
  runCondition?: 'always' | 'on_quaternary_positive' | 'on_primary_negative' | 'on_secondary_negative'; // When to run this detector
}

export class LakeraThreatDetector extends AilaThreatDetector {
  private readonly apiKey: string;
  private readonly apiUrl?: string;
  private readonly detectorConfigs: LakeraDetectorConfig[];

  constructor() {
    super();
    const apiKey = process.env.LAKERA_GUARD_API_KEY;
    const apiUrl = process.env.LAKERA_GUARD_URL;

    if (!apiKey)
      throw new Error("LAKERA_GUARD_API_KEY environment variable not set");

    this.apiKey = apiKey;
    this.apiUrl = apiUrl;

    // Configure multiple detectors with their project IDs
    this.detectorConfigs = [
      {
        projectId: process.env.LAKERA_GUARD_PROJECT_ID_4 || '',
        name: 'Quaternary Detector (First)',
        recordPolicyViolation: false,
        runCondition: 'always' as const
      },
      {
        projectId: process.env.LAKERA_GUARD_PROJECT_ID_1 || process.env.LAKERA_GUARD_PROJECT_ID || '',
        name: 'Primary Detector',
        recordPolicyViolation: true,
        runCondition: 'on_quaternary_positive' as const
      },
      {
        projectId: process.env.LAKERA_GUARD_PROJECT_ID_2 || '',
        name: 'Secondary Detector',
        recordPolicyViolation: true,
        runCondition: 'on_primary_negative' as const
      },
      {
        projectId: process.env.LAKERA_GUARD_PROJECT_ID_3 || '',
        name: 'Tertiary Detector',
        recordPolicyViolation: false,
        runCondition: 'on_secondary_negative' as const
      }
    ].filter(config => config.projectId) as LakeraDetectorConfig[]; // Only include detectors with valid project IDs

    if (this.detectorConfigs.length === 0) {
      throw new Error("No valid Lakera project IDs configured");
    }

    log.info("Lakera detector initialized", {
      detectorCount: this.detectorConfigs.length,
      detectors: this.detectorConfigs.map(d => ({ name: d.name, projectId: d.projectId, recordPolicyViolation: d.recordPolicyViolation }))
    });
  }

  protected async authenticate(): Promise<void> {
    // Authentication is handled via API key in headers
    return Promise.resolve();
  }

  private mapSeverity(detectorType: string): ThreatSeverity {
    // Map Lakera detector types to our severity levels
    switch (detectorType) {
      case "jailbreak":
      case "prompt_injection":
        return "critical";
      case "pii":
      case "sensitive_info":
        return "high";
      case "harmful_content":
        return "high";
      default:
        return "high";
    }
  }

  private mapCategory(detectorType: string): ThreatCategory {
    // Map Lakera detector types to our categories
    switch (detectorType) {
      case "jailbreak":
        return "system_prompt_override";
      case "prompt_injection":
        return "prompt_injection";
      case "pii":
        return "pii";
      case "sensitive_info":
        return "rag_exfiltration";
      default:
        return "other";
    }
  }

  private async callLakeraAPI(
    messages: Message[],
    projectId: string,
    detectorName: string
  ): Promise<LakeraGuardResponse> {
    const requestBody = {
      messages,
      project_id: projectId,
      payload: true,
      breakdown: true,
    };

    log.info("Lakera API request", {
      detectorName,
      projectId,
      url: this.apiUrl,
      exactRequestBody: JSON.stringify(requestBody),
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.slice(0, 100),
      })),
    });

    const parsedBody = lakeraGuardRequestSchema.parse(requestBody);

    const response = await fetch("https://api.lakera.ai/v2/guard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(parsedBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      log.error("Lakera API error", {
        detectorName,
        projectId,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseData,
        requestBody: parsedBody,
      });
      throw new Error(`Lakera API error (${detectorName}): ${response.statusText}`);
    }

    const parsed = lakeraGuardResponseSchema.parse(responseData);
    log.info("Lakera API response parsed", {
      detectorName,
      projectId,
      flagged: parsed.flagged,
      breakdown: parsed.breakdown,
      payload: parsed.payload,
    });
    return parsed;
  }

  private getHighestThreatFromBreakdown(
    data: LakeraGuardResponse,
  ): BreakdownItem | undefined {
    if (!data.breakdown?.length) return undefined;

    return data.breakdown.reduce(
      (highest, current) => {
        if (!current.detected) return highest;
        if (!highest) return current;

        const currentSeverity = this.mapSeverity(current.detector_type);
        const highestSeverity = this.mapSeverity(highest.detector_type);

        return this.compareSeverity(currentSeverity, highestSeverity) > 0
          ? current
          : highest;
      },
      undefined as BreakdownItem | undefined,
    );
  }

  private buildThreatResult(
    data: LakeraGuardResponse,
    highestThreat: BreakdownItem | undefined,
    detectorName: string,
    recordPolicyViolation: boolean
  ): ThreatDetectionResult {
    return {
      isThreat: data.flagged,
      severity: highestThreat
        ? this.mapSeverity(highestThreat.detector_type)
        : undefined,
      category: highestThreat
        ? this.mapCategory(highestThreat.detector_type)
        : undefined,
      message: data.flagged
        ? `Potential threat detected by ${detectorName}`
        : "No threats detected",
      rawResponse: {
        ...data,
        detectorName,
        recordPolicyViolation
      },
      details: {
        detectedElements: data.payload?.map((p) => p.text) ?? [],
        detectorName,
        recordPolicyViolation
      } as Record<string, unknown>, // Type assertion to allow additional properties
    };
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    log.info("Detecting threat with new conditional logic", {
      contentType: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 0,
      detectorCount: this.detectorConfigs.length,
    });

    if (
      !Array.isArray(content) ||
      !content.every((msg) => this.isMessage(msg))
    ) {
      log.error("Invalid input format", { content });
      throw new Error("Input must be an array of Messages");
    }

    const messages = extractPromptTextFromMessages(content);
    let quaternaryResult: ThreatDetectionResult | null = null;
    let primaryResult: ThreatDetectionResult | null = null;
    let secondaryResult: ThreatDetectionResult | null = null;
    let tertiaryResult: ThreatDetectionResult | null = null;

    // Step 1: Run Quaternary Detector (project_id_4) first
    const quaternaryConfig = this.detectorConfigs.find(c => c.name === 'Quaternary Detector (First)');
    if (quaternaryConfig) {
      try {
        log.info("Step 1: Running Quaternary Detector", {
          detectorName: quaternaryConfig.name,
          projectId: quaternaryConfig.projectId
        });

        const data = await this.callLakeraAPI(messages, quaternaryConfig.projectId, quaternaryConfig.name);
        const highestThreat = this.getHighestThreatFromBreakdown(data);
        quaternaryResult = this.buildThreatResult(data, highestThreat, quaternaryConfig.name, quaternaryConfig.recordPolicyViolation);

        log.info("Quaternary Detector completed", {
          isThreat: quaternaryResult.isThreat,
          severity: quaternaryResult.severity,
          category: quaternaryResult.category
        });

        // If quaternary returns false, do nothing
        if (!quaternaryResult.isThreat) {
          log.info("Quaternary Detector returned false - stopping detection");
          return {
            isThreat: false,
            message: "No threats detected (quaternary negative)",
            details: { detectorName: quaternaryConfig.name, step: 'quaternary_negative' } as Record<string, unknown>
          };
        }
      } catch (error) {
        log.error("Error running Quaternary Detector", {
          detectorName: quaternaryConfig.name,
          projectId: quaternaryConfig.projectId,
          error: error instanceof Error ? error.message : String(error)
        });
        // If quaternary fails, assume no threat and stop
        return {
          isThreat: false,
          message: "Quaternary Detector failed - assuming no threat",
          details: { detectorName: quaternaryConfig.name, error: true, step: 'quaternary_error' } as Record<string, unknown>
        };
      }
    }

    // Step 2: Run Primary Detector (project_id_1)
    const primaryConfig = this.detectorConfigs.find(c => c.name === 'Primary Detector');
    if (primaryConfig) {
      try {
        log.info("Step 2: Running Primary Detector", {
          detectorName: primaryConfig.name,
          projectId: primaryConfig.projectId
        });

        const data = await this.callLakeraAPI(messages, primaryConfig.projectId, primaryConfig.name);
        const highestThreat = this.getHighestThreatFromBreakdown(data);
        primaryResult = this.buildThreatResult(data, highestThreat, primaryConfig.name, primaryConfig.recordPolicyViolation);

        log.info("Primary Detector completed", {
          isThreat: primaryResult.isThreat,
          severity: primaryResult.severity,
          category: primaryResult.category
        });

        // If primary returns true, record violation and return
        if (primaryResult.isThreat) {
          log.info("Primary Detector returned true - recording violation and stopping");
          return primaryResult;
        }

        // Handle single-detector mode - if no quaternary detector ran, return primary result
        if (!quaternaryResult) {
          log.info("Single detector mode - returning primary result");
          return primaryResult;
        }
      } catch (error) {
        log.error("Error running Primary Detector", {
          detectorName: primaryConfig.name,
          projectId: primaryConfig.projectId,
          error: error instanceof Error ? error.message : String(error)
        });
        // If primary fails, continue to secondary
      }
    }

    // Step 3: Run Secondary Detector (project_id_2)
    const secondaryConfig = this.detectorConfigs.find(c => c.name === 'Secondary Detector');
    if (secondaryConfig) {
      try {
        log.info("Step 3: Running Secondary Detector", {
          detectorName: secondaryConfig.name,
          projectId: secondaryConfig.projectId
        });

        const data = await this.callLakeraAPI(messages, secondaryConfig.projectId, secondaryConfig.name);
        const highestThreat = this.getHighestThreatFromBreakdown(data);
        secondaryResult = this.buildThreatResult(data, highestThreat, secondaryConfig.name, secondaryConfig.recordPolicyViolation);

        log.info("Secondary Detector completed", {
          isThreat: secondaryResult.isThreat,
          severity: secondaryResult.severity,
          category: secondaryResult.category
        });

        // If secondary returns true, record violation and return
        if (secondaryResult.isThreat) {
          log.info("Secondary Detector returned true - recording violation and stopping");
          return secondaryResult;
        }
      } catch (error) {
        log.error("Error running Secondary Detector", {
          detectorName: secondaryConfig.name,
          projectId: secondaryConfig.projectId,
          error: error instanceof Error ? error.message : String(error)
        });
        // If secondary fails, continue to tertiary
      }
    }

    // Step 4: Run Tertiary Detector (project_id_3)
    const tertiaryConfig = this.detectorConfigs.find(c => c.name === 'Tertiary Detector');
    if (tertiaryConfig) {
      try {
        log.info("Step 4: Running Tertiary Detector", {
          detectorName: tertiaryConfig.name,
          projectId: tertiaryConfig.projectId
        });

        const data = await this.callLakeraAPI(messages, tertiaryConfig.projectId, tertiaryConfig.name);
        const highestThreat = this.getHighestThreatFromBreakdown(data);
        tertiaryResult = this.buildThreatResult(data, highestThreat, tertiaryConfig.name, tertiaryConfig.recordPolicyViolation);

        log.info("Tertiary Detector completed", {
          isThreat: tertiaryResult.isThreat,
          severity: tertiaryResult.severity,
          category: tertiaryResult.category
        });

        // If tertiary returns false, do nothing
        if (!tertiaryResult.isThreat) {
          log.info("Tertiary Detector returned false - no action taken");
          return {
            isThreat: false,
            message: "No threats detected (tertiary negative)",
            details: { detectorName: tertiaryConfig.name, step: 'tertiary_negative' } as Record<string, unknown>
          };
        }

        // If tertiary returns true, take extra step (to be decided later)
        log.info("Tertiary Detector returned true - extra step needed (to be implemented)");
        return {
          ...tertiaryResult,
          message: "Tertiary threat detected - extra step required",
          details: { 
            ...tertiaryResult.details,
            step: 'tertiary_positive_extra_step_needed'
          } as Record<string, unknown>
        };
      } catch (error) {
        log.error("Error running Tertiary Detector", {
          detectorName: tertiaryConfig.name,
          projectId: tertiaryConfig.projectId,
          error: error instanceof Error ? error.message : String(error)
        });
        // If tertiary fails, assume no threat
        return {
          isThreat: false,
          message: "Tertiary Detector failed - assuming no threat",
          details: { detectorName: tertiaryConfig.name, error: true, step: 'tertiary_error' } as Record<string, unknown>
        };
      }
    }

    // Fallback if no detectors ran successfully
    log.info("No detectors ran successfully - fallback result");
    return {
      isThreat: false,
      message: "No threats detected (fallback)",
      details: { fallback: true, step: 'no_detectors_ran' } as Record<string, unknown>
    };
  }

  private isMessage(msg: unknown): msg is Message {
    return z
      .object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
      .safeParse(msg).success;
  }

  async isThreatError(): Promise<boolean> {
    return Promise.resolve(false);
  }
}
