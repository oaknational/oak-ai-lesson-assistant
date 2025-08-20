import type OpenAI from "openai";

export const DEFAULT_MODEL = "gpt-5-mini-2025-08-07" as OpenAI.Chat.ChatModel;
export const DEFAULT_MODERATION_MODEL =
  "gpt-5-mini-2025-08-07" as OpenAI.Chat.ChatModel;
export const DEFAULT_CATEGORISE_MODEL =
  "gpt-5-mini-2025-08-07" as OpenAI.Chat.ChatModel;

export const DEFAULT_REASONING_EFFORT: "low" | "medium" | "high" =
  (process.env.OPENAI_DEFAULT_REASONING_EFFORT as "low" | "medium" | "high") ||
  "medium";
export const DEFAULT_VERBOSITY: "low" | "medium" | "high" =
  (process.env.OPENAI_DEFAULT_VERBOSITY as "low" | "medium" | "high") ||
  "medium";

export const isGPT5Model = (model: string): boolean => {
  return model.startsWith("gpt-5");
};

export const DEFAULT_LEGACY_TEMPERATURE = 0.7;
export const DEFAULT_MODERATION_TEMPERATURE = 0.7;
export const DEFAULT_NUMBER_OF_RECORDS_IN_RAG = 5;
export const BOT_USER_ID = "bot";
