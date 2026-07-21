import type OpenAI from "openai";

import type { QuestionSourceType } from "./core/quiz/schema";

export const DEFAULT_MODEL: OpenAI.Chat.ChatModel = "gpt-4o-2024-08-06";
export const DEFAULT_MODERATION_MODEL: OpenAI.Chat.ChatModel =
  "gpt-4o-2024-08-06";
export const DEFAULT_CATEGORISE_MODEL: OpenAI.Chat.ChatModel =
  "gpt-4o-2024-08-06";
// The model agentic requests run on, for the agents and moderation alike;
// non-agentic requests keep the defaults above. gpt-5.4 postdates the
// installed openai SDK's model unions; cast at each typed use until the
// SDK is bumped.
export const AGENTIC_MODEL_ID = "gpt-5.4-2026-03-05";
export const AGENTIC_MODERATION_MODEL =
  AGENTIC_MODEL_ID as OpenAI.Chat.ChatModel;
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MODERATION_TEMPERATURE = 0.7;
export const DEFAULT_NUMBER_OF_RECORDS_IN_RAG = 5;
export const DEFAULT_QUIZ_SOURCES: QuestionSourceType[] = [
  "currentQuiz",
  "similarLessons",
  "basedOnLesson",
  "multiQuerySemantic",
];
export const BOT_USER_ID = "bot";
