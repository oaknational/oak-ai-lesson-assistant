export function lessonPlanPartsBatchFileLine({
  lessonPlanId,
  key,
  textContent,
}: {
  lessonPlanId: string;
  key: string;
  textContent: string;
}) {
  const line = {
    custom_id: `${lessonPlanId}-${key}`,
    method: "POST",
    url: "/v1/embeddings",
    body: {
      model: "text-embedding-3-large", // check model!
      input: textContent,
      dimensions: 256,
    },
  };

  return line;
}
