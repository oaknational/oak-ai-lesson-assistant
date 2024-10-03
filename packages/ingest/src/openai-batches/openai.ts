import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.INGEST_OPENAI_API_KEY,
});
