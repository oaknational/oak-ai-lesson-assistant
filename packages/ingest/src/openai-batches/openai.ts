import OpenAI from "openai";

if (!process.env.INGEST_OPENAI_API_KEY) {
  throw new Error("Missing INGEST_OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.INGEST_OPENAI_API_KEY,
});
