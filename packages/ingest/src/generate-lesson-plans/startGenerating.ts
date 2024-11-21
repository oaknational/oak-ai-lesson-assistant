import type { PersistedIngest } from "../db-helpers/getIngestById";
import type { PersistedIngestLesson } from "../db-helpers/getLessonsByState";
import { startBatch } from "../openai-batches/startBatch";
import type { OpenAiBatchSubmitCallback } from "../openai-batches/submitOpenAiBatch";
import { CaptionsSchema } from "../zod-schema/zodSchema";
import { getLessonPlanBatchFileLine } from "./getLessonPlanBatchFileLine";

type StartGeneratingProps = {
  ingestId: string;
  lessons: PersistedIngestLesson[];
  onSubmitted: OpenAiBatchSubmitCallback;
  ingest: PersistedIngest;
};
export async function startGenerating({
  ingestId,
  ingest,
  lessons,
  onSubmitted,
}: StartGeneratingProps) {
  return startBatch({
    ingestId,
    data: lessons.map((lesson) => ({
      lessonId: lesson.id,
      rawLesson: lesson.data,
      captions: lesson.captions
        ? CaptionsSchema.parse(lesson.captions?.data)
        : undefined,
      ingest,
    })),
    endpoint: "/v1/chat/completions",
    getBatchFileLine: getLessonPlanBatchFileLine,
    onSubmitted,
  });
}
