export function batchLineEmbedding({
  customId,
  textToEmbed,
  embeddingModel,
  embeddingDimensions,
}: {
  customId: string;
  textToEmbed: string;
  embeddingModel: string;
  embeddingDimensions: number;
}) {
  return {
    custom_id: customId,
    method: "POST",
    url: "/v1/embeddings",
    body: {
      model: embeddingModel,
      dimensions: embeddingDimensions,
      input: textToEmbed,
    },
  };
}
