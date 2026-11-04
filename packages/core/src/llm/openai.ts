import type { ClientOptions } from "openai";
import OpenAI from "openai";

import type { HeliconeChatMeta } from "./helicone";
import { heliconeHeaders } from "./helicone";

export type CreateOpenAIClientProps =
  | {
      chatMeta: HeliconeChatMeta;
      app: "lesson-assistant" | "moderation";
    }
  | {
      app:
        | "image-alt-text"
        | "maths-reranker"
        | "quiz-composer"
        | "maths-quiz-images";
    };

function createOpenAIClient(props: CreateOpenAIClientProps): OpenAI {
  const openAiFields: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.HELICONE_EU_HOST,
    defaultHeaders: {
      ...heliconeHeaders(props),
    },
  };
  return new OpenAI(openAiFields);
}

// The helicone proxy throws a 500: "Failed to parse the latest message" error
// on moderations.create calls. Use openAI directly for these
function createOpenAIModerationsClient() {
  const openAiFields = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_MODERATIONS_API_BASE,
  };
  const openAi = new OpenAI(openAiFields);
  return openAi.moderations;
}

export { createOpenAIClient, createOpenAIModerationsClient };
