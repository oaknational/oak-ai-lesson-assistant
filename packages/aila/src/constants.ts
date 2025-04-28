import type OpenAI from "openai";

export const DEFAULT_MODEL: OpenAI.Chat.ChatModel = "gpt-4.1-2025-04-14";
export const DEFAULT_MODERATION_MODEL: OpenAI.Chat.ChatModel =
  "gpt-4.1-2025-04-14";
export const DEFAULT_CATEGORISE_MODEL: OpenAI.Chat.ChatModel =
  "gpt-4.1-2025-04-14";
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MODERATION_TEMPERATURE = 0.7;
export const DEFAULT_NUMBER_OF_RECORDS_IN_RAG = 5;
export const BOT_USER_ID = "bot";
