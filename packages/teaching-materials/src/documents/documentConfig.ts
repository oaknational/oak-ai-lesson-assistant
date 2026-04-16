import type { ZodSchema } from "zod";

export type DocumentConfig<T> = Record<
  string,
  {
    schema: ZodSchema;
    getPrompt: (ctx: T) => {
      prompt: string;
      systemMessage?: string;
    };
  }
>;
