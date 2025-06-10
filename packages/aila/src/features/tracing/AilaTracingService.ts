export interface AilaTracingService {
  span<T>(
    name: string,
    options: { op?: string; [key: string]: string | number | boolean | undefined },
    handler: () => Promise<T>,
  ): Promise<T>;
}
