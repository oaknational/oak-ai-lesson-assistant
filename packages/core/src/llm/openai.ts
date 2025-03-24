import type { OpenAIProvider } from "@ai-sdk/openai";
import { createOpenAI } from "@ai-sdk/openai";
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
      app: "legacy-lesson-planner" | "image-alt-text";
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

function createVercelOpenAIClient(
  props: CreateOpenAIClientProps,
): OpenAIProvider {
  const headers = heliconeHeaders(props);
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.HELICONE_EU_HOST,
    headers,
    compatibility: "strict",
  });
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

export {
  createOpenAIClient,
  createVercelOpenAIClient,
  createOpenAIModerationsClient,
};
