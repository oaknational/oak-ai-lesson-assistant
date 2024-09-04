import { createOpenAI } from "@ai-sdk/openai";
import { ChatOpenAI as LangchainChatOpenAI } from "langchain/chat_models/openai";
import { BaseLLMParams } from "langchain/llms/base";
import {
  AzureOpenAIInput,
  OpenAIInput,
  OpenAI as OpenAILangchain,
} from "langchain/llms/openai";
import { ClientOptions } from "openai";

import { HeliconeChatMeta, heliconeHeaders } from "./helicone";

export type CreateOpenAIClientProps =
  | {
      chatMeta: HeliconeChatMeta;
      app: "lesson-assistant" | "moderation";
    }
  | {
      app: "legacy-lesson-planner" | "image-alt-text";
    };

function createOpenAIClient(props: CreateOpenAIClientProps) {
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
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_MODERATIONS_API_BASE,
    compatibility: "strict",
  });
}

function createOpenAILangchainClient({
  app,
  fields = {},
}: {
  app: string;
  fields?: Partial<OpenAIInput> &
    Partial<AzureOpenAIInput> &
    BaseLLMParams & {
      configuration?: ClientOptions;
    };
}) {
  const defaultHeaders = heliconeHeaders({ app });
  return new OpenAILangchain({
    ...fields,
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.HELICONE_EU_HOST,
      defaultHeaders,
    },
  });
}

function createOpenAILangchainChatClient({
  app,
  fields = {},
}: {
  app: string;
  fields?: Partial<OpenAIInput> &
    Partial<AzureOpenAIInput> &
    BaseLLMParams & {
      configuration?: ClientOptions;
    };
}) {
  const defaultHeaders = heliconeHeaders({ app });
  return new LangchainChatOpenAI({
    ...fields,
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.HELICONE_EU_HOST,
      defaultHeaders,
    },
  });
}

export {
  createOpenAIClient,
  createOpenAIModerationsClient,
  createOpenAILangchainClient,
  createOpenAILangchainChatClient,
};
