import type { OpenAI } from "openai";

const DEFAULT_EMBEDDING_MODEL: OpenAI.Embeddings.EmbeddingCreateParams["model"] =
  "text-embedding-3-large";

export async function getEmbedding({
  text,
  openai,
}: {
  text: string;
  openai: OpenAI;
}): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: DEFAULT_EMBEDDING_MODEL,
    dimensions: 256,
    input: text,
    encoding_format: "float",
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error("Failed to get embedding");
  }

  return embedding;
}
