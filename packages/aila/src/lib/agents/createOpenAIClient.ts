import OpenAI, { type ClientOptions } from "openai";

export function createOpenAIClient(): OpenAI {
  const openAiFields: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.HELICONE_EU_HOST,
  };
  return new OpenAI(openAiFields);
}
