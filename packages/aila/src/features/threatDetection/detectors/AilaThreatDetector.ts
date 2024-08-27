export abstract class AilaThreatDetector {
  abstract isThreat(error: unknown): Promise<boolean>;
}
