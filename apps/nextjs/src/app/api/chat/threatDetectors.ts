import type { AilaThreatDetector } from "@oakai/aila/src/features/threatDetection";
import { HeliconeThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/helicone/HeliconeThreatDetector";
import { LakeraThreatDetector } from "@oakai/aila/src/features/threatDetection/detectors/lakera/LakeraThreatDetector";
import { getThreatDetectionProvider } from "@oakai/core/src/threatDetection/provider";

export function getThreatDetectors(): AilaThreatDetector[] {
  switch (getThreatDetectionProvider()) {
    case "lakera":
      return [new HeliconeThreatDetector(), new LakeraThreatDetector()];
    case "model_armor":
      // QA-only: Model Armor disabled on this branch. Helicone still runs.
      return [new HeliconeThreatDetector()];
  }
}
