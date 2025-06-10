import type { startSpan } from "@oakai/core/src/tracing";

import type { AilaTracingService } from "./AilaTracingService";

export class SentryTracingService implements AilaTracingService {
  constructor(private readonly startSpanFn: typeof startSpan) {}

  async span<T>(
    name: string,
    options: {
      op?: string;
      [key: string]: string | number | boolean | undefined;
    },
    handler: () => Promise<T>,
  ): Promise<T> {
    return await this.startSpanFn(name, options, handler);
  }
}
