import { PersistedIngestLesson } from "../db-helpers/getLessonsByState";
import {
  OPEN_AI_BATCH_MAX_ROWS,
  OPEN_AI_BATCH_MAX_SIZE_MB,
} from "../openai-batches/constants";
import {
  OpenAiBatchSubmitCallback,
  submitOpenAiBatch,
} from "../openai-batches/submitOpenAiBatch";
import { uploadOpenAiBatchFile } from "../openai-batches/uploadOpenAiBatchFile";
import { writeBatchFile } from "../openai-batches/writeBatchFile";
import { splitJsonlByRowsOrSize } from "../utils/splitJsonlByRowsOrSize";
import { CaptionsSchema } from "../zod-schema/zodSchema";
import { getLessonPlanBatchFileLine } from "./getLessonPlanBatchFileLine";

export async function startGenerating({
  ingestId,
  lessons,
  onSubmitted,
}: {
  ingestId: string;
  lessons: PersistedIngestLesson[];
  onSubmitted: OpenAiBatchSubmitCallback;
}) {
  const { filePath, batchDir } = await writeBatchFile({
    ingestId,
    data: lessons.map((lesson) => ({
      lessonId: lesson.id,
      rawLesson: lesson.data,
      captions: CaptionsSchema.parse(lesson.captions?.data),
    })),
    getBatchFileLine: getLessonPlanBatchFileLine,
  });
  const { filePaths } = await splitJsonlByRowsOrSize({
    inputFilePath: filePath,
    outputDir: batchDir,
    maxRows: OPEN_AI_BATCH_MAX_ROWS,
    maxFileSizeMB: OPEN_AI_BATCH_MAX_SIZE_MB,
  });

  for (const filePath of filePaths) {
    const { file } = await uploadOpenAiBatchFile({
      filePath,
    });
    const { batch: openaiBatch } = await submitOpenAiBatch({
      fileId: file.id,
      endpoint: "/v1/chat/completions",
    });

    await onSubmitted({ openaiBatchId: openaiBatch.id, filePath });
  }
}
