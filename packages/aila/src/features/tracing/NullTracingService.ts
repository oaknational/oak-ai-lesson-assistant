import type { AilaTracingService } from "./AilaTracingService";

export class NullTracingService implements AilaTracingService {
  async span<T>(
    name: string,
    options: {
      op?: string;
      [key: string]: string | number | boolean | undefined;
    },
    handler: () => Promise<T>,
  ): Promise<T> {
    // No-op implementation - just execute the handler without tracing
    return await handler();
  }
}
