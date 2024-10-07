import { IngestError } from "../IngestError";
import { parseEmbeddingCustomId } from "../steps/helpers";
import { EmbeddingsBatchResponseSchema } from "../zod-schema/zodSchema";

export function parseBatchEmbedding(line: unknown) {
  let result;
  try {
    result = EmbeddingsBatchResponseSchema.parse(line);
  } catch (cause) {
    throw new IngestError("Failed to parse embedding batch response", {
      cause,
      errorDetail: line,
    });
  }
  const { lessonPlanPartId, lessonId, partKey } = parseEmbeddingCustomId(
    result.custom_id,
  );

  if (result.error) {
    throw new IngestError("Embedding batch response contains error", {
      errorDetail: result,
    });
  }

  const embedding = result.response.body.data[0]?.embedding;

  if (!embedding) {
    throw new IngestError("Failed to extract embedding from response", {
      errorDetail: result,
    });
  }

  return { lessonId, partKey, lessonPlanPartId, embedding };
}
