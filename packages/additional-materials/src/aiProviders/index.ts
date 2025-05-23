import { OpenAIProvider } from "./openaiProvider";

export const providers = {
  openai: OpenAIProvider,
};

export type ProviderKey = keyof typeof providers;
