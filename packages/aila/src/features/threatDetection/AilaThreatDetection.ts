import type { AilaThreatDetectionFeature } from "../types";
import type { AilaThreatDetector } from "./detectors/AilaThreatDetector";
import { HeliconeThreatDetector } from "./detectors/HeliconeThreatDetector";

export class AilaThreatDetection implements AilaThreatDetectionFeature {
  private _detector: AilaThreatDetector;

  get detector() {
    return this._detector;
  }

  constructor({ detector }: { detector?: AilaThreatDetector }) {
    this._detector = detector ?? new HeliconeThreatDetector();
  }
}
