import { AilaThreatDetector } from "./AilaThreatDetector";

export class HeliconeThreatDetector extends AilaThreatDetector {
  async isThreat(error: unknown) {
    const isIt: boolean =
      error instanceof Error &&
      "code" in error &&
      error.code === "PROMPT_THREAT_DETECTED";
    return isIt;
  }
}
