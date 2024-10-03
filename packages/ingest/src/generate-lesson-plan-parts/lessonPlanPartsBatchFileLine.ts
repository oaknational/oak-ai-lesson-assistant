import { getEmbeddingCustomId } from "../steps/helpers";

export function lessonPlanPartsBatchFileLine({
  lessonId,
  key,
  textContent,
}: {
  lessonId: string;
  key: string;
  textContent: string;
}) {
  const line = {
    custom_id: getEmbeddingCustomId({ lessonId, partKey: key }),
    method: "POST",
    url: "/v1/embeddings",
    body: {
      model: "text-embedding-3-large",
      input: textContent,
      dimensions: 256,
    },
  };

  return line;
}
