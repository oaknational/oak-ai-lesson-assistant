import { BaseLLMParams } from "langchain/llms/base";
import {
  AzureOpenAIInput,
  OpenAIInput,
  OpenAI as OpenAILangchain,
} from "langchain/llms/openai";
import OpenAI, { ClientOptions } from "openai";

function heliconeHeaders({
  chatId,
  userId,
  app,
}: {
  chatId?: string;
  userId?: string;
  app: string;
}) {
  if (
    !process.env.HELICONE_EU_API_KEY ||
    !process.env.HELICONE_EU_HOST?.includes("hconeai")
  ) {
    throw new Error("Missing required environment variables for Helicone");
  }

  const heliconeSecurityEnabled =
    process.env.HELICONE_LLM_SECURITY_ENABLED === "true";

  const headers = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_EU_API_KEY}`,
    "Helicone-Posthog-Key": `${process.env.HELICONE_POSTHOG_KEY}`,
    "Helicone-Posthog-Host": `${process.env.HELICONE_POSTHOG_HOST}`,
    "Helicone-Property-App": app,
    "Helicone-Property-Environment": `${process.env.NEXT_PUBLIC_SENTRY_ENV}`,
    ...(heliconeSecurityEnabled && {
      "Helicone-LLM-Security-Enabled": "true",
    }),
    ...(userId && {
      "Helicone-Property-User": userId,
      "Helicone-User-Id": userId,
    }),
    ...(chatId && {
      "Helicone-Property-Chat": chatId,
    }),
  };
  return headers;
}

function createOpenAIClient({
  chatId,
  userId,
  app,
}: {
  chatId?: string;
  userId?: string;
  app: string;
}) {
  const openAiFields: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.HELICONE_EU_HOST,
    defaultHeaders: {
      ...heliconeHeaders({ chatId, userId, app }),
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

function createOpenAILangchainClient({
  chatId,
  userId,
  app,
  fields = {},
}: {
  chatId?: string;
  userId?: string;
  app: string;
  fields?: Partial<OpenAIInput> &
    Partial<AzureOpenAIInput> &
    BaseLLMParams & {
      configuration?: ClientOptions;
    };
}) {
  const defaultHeaders = heliconeHeaders({ chatId, userId, app });
  return new OpenAILangchain({
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
};
