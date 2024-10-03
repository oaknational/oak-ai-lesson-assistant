export function batchLineEmbedding({
  lineId,
  textToEmbed,
}: {
  lineId: string;
  textToEmbed: string;
}) {
  const line = {
    custom_id: lineId,
    method: "POST",
    url: "/v1/embeddings",
    body: {
      model: "text-embedding-3-large",
      input: textToEmbed,
      dimensions: 256,
    },
  };

  return line;
}
