import type OpenAI from "openai";

import type { QuestionSourceType } from "./core/quiz/schema";

// gpt-5.4 postdates the installed openai SDK, whose ChatModel union
// doesn't list it yet; cast until the SDK is bumped.
export const DEFAULT_MODEL = "gpt-5.4-2026-03-05" as OpenAI.Chat.ChatModel;
export const DEFAULT_MODERATION_MODEL =
  "gpt-5.4-2026-03-05" as OpenAI.Chat.ChatModel;
export const DEFAULT_CATEGORISE_MODEL =
  "gpt-5.4-2026-03-05" as OpenAI.Chat.ChatModel;
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
