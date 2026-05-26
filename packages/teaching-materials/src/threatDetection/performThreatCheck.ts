import { getThreatDetectionProvider } from "@oakai/core/src/threatDetection/provider";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";

import { performLakeraThreatCheck } from "./lakeraThreatCheck";
import { performModelArmorThreatCheck } from "./modelArmorThreatCheck";

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
      return performModelArmorThreatCheck({ messages });
  }
}
