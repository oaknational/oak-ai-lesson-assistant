import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { performLakeraThreatCheck } from "./lakeraThreatCheck";
import { performModelArmorThreatCheck } from "./modelArmorThreatCheck";

export interface ThreatCheckParams {
  messages: ThreatDetectionMessage[];
}

type ThreatCheckProvider = "lakera" | "model_armor";

const ACTIVE_THREAT_CHECK_PROVIDER: ThreatCheckProvider = "model_armor";

export async function performThreatCheck({
  messages,
}: ThreatCheckParams): Promise<ThreatDetectionResult> {
  switch (ACTIVE_THREAT_CHECK_PROVIDER) {
    case "lakera":
      return performLakeraThreatCheck({ messages });
    case "model_armor":
      return performModelArmorThreatCheck({ messages });
  }
}
