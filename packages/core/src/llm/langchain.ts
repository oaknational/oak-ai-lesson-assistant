import type { BaseLLMParams } from "langchain/llms/base";
import type { AzureOpenAIInput, OpenAIInput } from "langchain/llms/openai";
import { OpenAI as OpenAILangchain } from "langchain/llms/openai";
import type { ClientOptions } from "openai";

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
