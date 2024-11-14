import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import invariant from "tiny-invariant";
import { Md5 } from "ts-md5";

export const embedWithCache = async (text: string) => {
  invariant(
    process.env.UPSTASH_EMBEDDINGS_CACHE_URL,
    "UPSTASH_EMBEDDINGS_CACHE_URL is required",
  );
  invariant(
    process.env.UPSTASH_EMBEDDINGS_CACHE_TOKEN,
    "UPSTASH_EMBEDDINGS_CACHE_TOKEN is required",
  );
  const redis = new Redis({
    url: process.env.UPSTASH_EMBEDDINGS_CACHE_URL,
    token: process.env.UPSTASH_EMBEDDINGS_CACHE_TOKEN,
  });
  const hash = Md5.hashStr(text);
  const existing = await redis.get<number[]>(hash);
  if (existing) {
    return existing;
  }

  const embedder = new OpenAIEmbeddings();
  const embeddings = await embedder.embedQuery(text);
  if (!embeddings || embeddings.length === 0) {
    throw new Error("Unable to embed snippet");
  }
  const result = await redis.set<number[]>(hash, embeddings);
  if (!result) {
    throw new Error("Unable to cache embeddings");
  }
  return embeddings;
};

export const embedWithCacheTextLarge = async (text: string) => {
  invariant(
    process.env.UPSTASH_EMBEDDINGS_CACHE_URL,
    "UPSTASH_EMBEDDINGS_CACHE_URL is required",
  );
  invariant(
    process.env.UPSTASH_EMBEDDINGS_CACHE_TOKEN,
    "UPSTASH_EMBEDDINGS_CACHE_TOKEN is required",
  );
  const redis = new Redis({
    url: process.env.UPSTASH_EMBEDDINGS_CACHE_URL,
    token: process.env.UPSTASH_EMBEDDINGS_CACHE_TOKEN,
  });
  const hash = Md5.hashStr(text);
  const existing = await redis.get<number[]>(hash);
  if (existing) {
    return existing;
  }

  const embedder = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });
  const embeddings = await embedder.embedQuery(text);
  if (!embeddings || embeddings.length === 0) {
    throw new Error("Unable to embed snippet");
  }
  const result = await redis.set<number[]>(hash, embeddings);
  if (!result) {
    throw new Error("Unable to cache embeddings");
  }
  return embeddings;
};

export const embedTextLarge = async (text: string): Promise<number[]> => {
  const embedder = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });
  const embeddings = await embedder.embedQuery(text);
  if (!embeddings || embeddings.length === 0) {
    throw new Error("Unable to embed snippet");
  }
  return embeddings;
};
