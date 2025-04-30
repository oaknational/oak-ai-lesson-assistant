import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import {
  AilaThreatDetector,
  type ThreatCategory,
  type ThreatDetectionResult,
  type ThreatSeverity,
} from "../AilaThreatDetector";
import type { BreakdownItem, LakeraGuardResponse, Message } from "./schema";
import { lakeraGuardRequestSchema, lakeraGuardResponseSchema } from "./schema";

const log = aiLogger("aila:threat");

export class LakeraThreatDetector extends AilaThreatDetector {
  private readonly apiKey: string;
  private readonly projectId?: string;
  private readonly apiUrl?: string;

  constructor() {
    super();
    const apiKey = process.env.LAKERA_GUARD_API_KEY;
    const projectId = process.env.LAKERA_GUARD_PROJECT_ID;
    const apiUrl = process.env.LAKERA_GUARD_URL;

    if (!apiKey)
      throw new Error("LAKERA_GUARD_API_KEY environment variable not set");

    if (!apiUrl)
      throw new Error("LAKERA_GUARD_API_URL environment variable not set");

    this.apiKey = apiKey;
    this.projectId = projectId;
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
  ): Promise<LakeraGuardResponse> {
    const requestBody = {
      messages,
      ...(this.projectId && { project_id: this.projectId }),
      payload: true,
      breakdown: true,
    };

    log.info("Lakera API request", {
      url: this.apiUrl,
      projectId: this.projectId,
      exactRequestBody: JSON.stringify(requestBody),
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.slice(0, 100),
      })),
    });

    const parsedBody = lakeraGuardRequestSchema.parse(requestBody);

    log.info("Lakera API request", {
      url: this.apiUrl,
      projectId: this.projectId,
      exactRequestBody: JSON.stringify(parsedBody),
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.slice(0, 100),
      })),
    });

    const response = await fetch(this.apiUrl, {
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
        status: response.status,
        statusText: response.statusText,
        responseBody: responseData,
        requestBody: parsedBody,
      });
      throw new Error(`Lakera API error: ${response.statusText}`);
    }

    const parsed = lakeraGuardResponseSchema.parse(responseData);
    log.info("Lakera API response parsed", {
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
        ? "Potential threat detected"
        : "No threats detected",
      rawResponse: data,
      details: {
        detectedElements: data.payload?.map((p) => p.text) ?? [],
      },
    };
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    log.info("Detecting threat", {
      contentType: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 0,
    });

    if (
      !Array.isArray(content) ||
      !content.every((msg) => this.isMessage(msg))
    ) {
      log.error("Invalid input format", { content });
      throw new Error("Input must be an array of Messages");
    }

    const data = await this.callLakeraAPI(content);

    if (!data.flagged) {
      return {
        isThreat: false,
        message: "No threats detected",
        details: {},
        rawResponse: data,
      };
    }

    const highestThreat = this.getHighestThreatFromBreakdown(data);
    return this.buildThreatResult(data, highestThreat);
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
