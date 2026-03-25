import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";

import { AilaError } from "../../core/AilaError";

export class AilaThreatDetectionError extends AilaError {
  public readonly userId: string;
  public readonly threatDetection?: ThreatDetectionResult;
  public isAnalyticsEventReported: boolean;
  public isSafetyViolationRecorded: boolean;

  constructor(
    userId: string,
    message: string,
    threatDetection?: ThreatDetectionResult,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AilaThreatDetectionError";
    this.userId = userId;
    this.threatDetection = threatDetection;
    this.isAnalyticsEventReported = false;
    this.isSafetyViolationRecorded = false;
  }
}
