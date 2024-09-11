import { AilaError } from "../../core/AilaError";

export class AilaThreatDetectionError extends AilaError {
  public readonly userId: string;

  constructor(userId: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaThreatDetectionError";
    this.userId = userId;
  }
}
