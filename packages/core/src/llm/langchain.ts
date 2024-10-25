import { ChatOpenAI as LangchainChatOpenAI } from "langchain/chat_models/openai";
import { BaseLLMParams } from "langchain/llms/base";
import {
  AzureOpenAIInput,
  OpenAIInput,
  OpenAI as OpenAILangchain,
} from "langchain/llms/openai";
import { ClientOptions } from "openai";

import { heliconeHeaders } from "./helicone";

export function createOpenAILangchainClient({
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

export function createOpenAILangchainChatClient({
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
