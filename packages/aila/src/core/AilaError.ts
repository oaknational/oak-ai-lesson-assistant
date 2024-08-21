export class AilaError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaError";
  }
}

export class AilaAuthenticationError extends AilaError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaAuthenticationError";
  }
}

export class AilaConfigurationError extends AilaError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaConfigurationError";
  }
}

export class AilaGenerationError extends AilaError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaGenerationError";
  }
}

export class AilaChatError extends AilaError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AilaChatError";
  }
}
