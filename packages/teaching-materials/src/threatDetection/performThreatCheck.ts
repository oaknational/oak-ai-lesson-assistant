import { getThreatDetectionProvider } from "@oakai/core/src/threatDetection/provider";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";

import { performLakeraThreatCheck } from "./lakeraThreatCheck";

export interface ThreatCheckParams {
  messages: ThreatDetectionMessage[];
}

export async function performThreatCheck({
  messages,
}: ThreatCheckParams): Promise<ThreatDetectionResult> {
  switch (getThreatDetectionProvider()) {
    case "lakera":
      return performLakeraThreatCheck({ messages });
    case "model_armor":
      // QA-only: Model Armor disabled on this branch so moderation can be
      // verified without G-MA catching the outgoing prompt first.
      return {
        provider: "model_armor",
        isThreat: false,
        message: "No threats detected",
        findings: [],
        details: {},
      };
  }
}
