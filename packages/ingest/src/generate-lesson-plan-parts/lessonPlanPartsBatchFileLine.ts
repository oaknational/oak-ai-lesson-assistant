export function lessonPlanPartsBatchFileLine({
  lessonPlanPartId,
  textToEmbed,
}: {
  lessonPlanPartId: string;
  textToEmbed: string;
}) {
  const line = {
    custom_id: lessonPlanPartId,
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
