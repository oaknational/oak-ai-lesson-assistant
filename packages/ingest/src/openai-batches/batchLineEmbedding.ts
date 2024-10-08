export function batchLineEmbedding({
  customId,
  textToEmbed,
}: {
  customId: string;
  textToEmbed: string;
}) {
  return {
    custom_id: customId,
    method: "POST",
    url: "/v1/embeddings",
    body: {
      model: "text-embedding-3-large",
      input: textToEmbed,
      dimensions: 256,
    },
  };
}
