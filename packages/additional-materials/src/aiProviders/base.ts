import type { ZodSchema } from "zod";

export interface ModelProvider {
  generateObject<T>({
    prompt,
    schema,
    systemMessage,
  }: {
    prompt: string;
    schema: ZodSchema<T>;
    systemMessage?: string;
  }): Promise<T>;
}
