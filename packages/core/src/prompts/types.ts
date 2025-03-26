import type { z } from "zod";

export type OakPromptDefinition = {
  name: string;
  slug: string;
  appId: string;
  variants: OakPromptVariant[];
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
};

export type OakPromptVariant = {
  slug: string;
  parts: OakPromptParts;
};

export type OakPromptParts = {
  body: string;
  context: string;
  output: string;
  task: string;
};
