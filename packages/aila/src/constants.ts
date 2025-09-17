import type OpenAI from "openai";

import type { QuizGeneratorType } from "./core/quiz/schema";

const DEFAULT_MODEL: OpenAI.Chat.ChatModel = "gpt-5-mini-2025-08-07";
const DEFAULT_MODERATION_MODEL: OpenAI.Chat.ChatModel = "gpt-4.1-2025-04-14";
const DEFAULT_CATEGORISE_MODEL: OpenAI.Chat.ChatModel = "gpt-5-mini-2025-08-07";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MODERATION_TEMPERATURE = 0.7;
export const DEFAULT_NUMBER_OF_RECORDS_IN_RAG = 5;
export const DEFAULT_QUIZ_GENERATORS: QuizGeneratorType[] = [
  "ml",
  "rag",
  "basedOnRag",
];
export const BOT_USER_ID = "bot";

type Params = {
  model: OpenAI.Chat.ChatModel;
};

type GPT4Params = {
  model: Extract<
    OpenAI.Chat.ChatModel,
    "gpt-4o-2024-08-06" | "gpt-4.1-2025-04-14" | "sef"
  >;
  temperature: number;
};

type Verbosity = "low" | "medium" | "high";
type ReasoningEffort = "minimal" | "low" | "medium" | "high";
type GPT5Params = {
  model: Extract<
    OpenAI.Chat.ChatModel,
    "gpt-5-2025-08-07" | "gpt-5-mini-2025-08-07"
  >;
  reasoning_effort: ReasoningEffort;
  verbosity: Verbosity;
};

export type OpenAIModelParams = GPT4Params | GPT5Params;

export const DEFAULT_OPENAI_GPT4_PARAMS: GPT4Params = {
  model: "gpt-4o-2024-08-06",
  temperature: DEFAULT_TEMPERATURE,
};

export const DEFAULT_OPENAI_GPT5_PARAMS: GPT5Params = {
  model: DEFAULT_MODEL,
  reasoning_effort: "low",
  verbosity: "low",
};

export const DEFAULT_MODERATION_GPT4_PARAMS: GPT4Params = {
  model: DEFAULT_MODERATION_MODEL,
  temperature: DEFAULT_MODERATION_TEMPERATURE,
};

export const DEFAULT_MODERATION_GPT5_PARAMS: GPT5Params = {
  model: DEFAULT_MODEL,
  reasoning_effort: "low",
  verbosity: "low",
};

export const DEFAULT_CATEGORISE_GPT4_PARAMS: GPT4Params = {
  model: "gpt-4o-2024-08-06",
  temperature: DEFAULT_TEMPERATURE,
};

export const DEFAULT_CATEGORISE_GPT5_PARAMS: GPT5Params = {
  model: DEFAULT_MODEL,
  reasoning_effort: "low",
  verbosity: "low",
};
