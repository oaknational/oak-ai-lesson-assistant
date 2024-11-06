import type OpenAI from "openai";

export const DEFAULT_MODEL: OpenAI.Chat.ChatModel = "gpt-4o-2024-08-06";
export const DEFAULT_MODERATION_MODEL: OpenAI.Chat.ChatModel =
  "gpt-4o-2024-08-06";
export const DEFAULT_CATEGORISE_MODEL: OpenAI.Chat.ChatModel =
  "gpt-4o-2024-08-06";
export const DEFAULT_EMBEDDING_MODEL: OpenAI.Embeddings.EmbeddingCreateParams["model"] =
  "text-embedding-3-large";
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MODERATION_TEMPERATURE = 0.7;
export const DEFAULT_RAG_LESSON_PLANS = 5;
export const BOT_USER_ID = "bot";
