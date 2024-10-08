export class IngestError extends Error {
  ingestId?: string;
  lessonId?: string;
  errorDetail?: unknown;

  constructor(
    message: string,
    options?: ErrorOptions & {
      ingestId?: string;
      lessonId?: string;
      errorDetail?: unknown;
    },
  ) {
    super(message, options);
    this.ingestId = options?.ingestId;
    this.lessonId = options?.lessonId;
    this.errorDetail = options?.errorDetail;
    this.name = "IngestError";

    // Ensure proper stack trace (especially in V8 environments like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IngestError);
    }
  }
}
