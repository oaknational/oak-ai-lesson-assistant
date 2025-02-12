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
  private readonly projectId: string;
  private readonly apiUrl = "https://api.lakera.ai/v1/guard";

  constructor() {
    super();
    const apiKey = process.env.LAKERA_API_KEY;
    const projectId = process.env.LAKERA_PROJECT_ID;

    if (!apiKey) throw new Error("LAKERA_API_KEY environment variable not set");
    if (!projectId)
      throw new Error("LAKERA_PROJECT_ID environment variable not set");

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
        return "medium";
      default:
        return "low";
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
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(
        lakeraGuardRequestSchema.parse({
          messages,
          project_id: this.projectId,
          breakdown: true,
        }),
      ),
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
      isThreat: true,
      severity: highestThreat
        ? this.mapSeverity(highestThreat.detector_type)
        : "medium",
      category: highestThreat
        ? this.mapCategory(highestThreat.detector_type)
        : "other",
      message: "Potential threat detected by Lakera Guard",
      rawResponse: data,
      details: {
        detectedElements: data.payload?.map((p) => p.text) || [],
        confidence: 1.0,
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
        details: { confidence: 1.0 },
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
