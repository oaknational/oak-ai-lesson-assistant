import { z } from "zod";

import {
  type ThreatCategory,
  type ThreatDetectionResult,
  type ThreatSeverity,
  AilaThreatDetector,
} from "../AilaThreatDetector";
import type { Message, LakeraGuardResponse, BreakdownItem } from "./schema";
import { lakeraGuardRequestSchema, lakeraGuardResponseSchema } from "./schema";

export class LakeraThreatDetector extends AilaThreatDetector {
  private readonly apiKey: string;
  private readonly projectId?: string;
  private readonly apiUrl = "https://api.lakera.ai/v1/guard";

  constructor() {
    super();
    const apiKey = process.env.LAKERA_GUARD_API_KEY;
    const projectId = process.env.LAKERA_GUARD_PROJECT_ID;

    if (!apiKey)
      throw new Error("LAKERA_GUARD_API_KEY environment variable not set");

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
      breakdown: true,
      ...(this.projectId && { project_id: this.projectId }),
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(lakeraGuardRequestSchema.parse(requestBody)),
    });

    if (!response.ok) {
      throw new Error(`Lakera API error: ${response.statusText}`);
    }

    return lakeraGuardResponseSchema.parse(await response.json());
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
        ? "Potential threat detected by Lakera Guard"
        : "No threats detected",
      rawResponse: data,
      details: {
        detectedElements: data.payload?.map((p) => p.text) || [],
      },
    };
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    if (
      !Array.isArray(content) ||
      !content.every((msg) => this.isMessage(msg))
    ) {
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
