import { AilaError } from "../../core/AilaError";

export class AilaThreatDetectionError extends AilaError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaThreatDetectionError";
  }
}
