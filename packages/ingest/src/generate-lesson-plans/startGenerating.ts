import { PersistedIngestLesson } from "../db-helpers/getLessonsByState";
import { startBatch } from "../openai-batches/startBatch";
import { OpenAiBatchSubmitCallback } from "../openai-batches/submitOpenAiBatch";
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
  return startBatch({
    ingestId,
    data: lessons.map((lesson) => ({
      lessonId: lesson.id,
      rawLesson: lesson.data,
      captions: CaptionsSchema.parse(lesson.captions?.data),
    })),
    endpoint: "/v1/chat/completions",
    getBatchFileLine: getLessonPlanBatchFileLine,
    onSubmitted,
  });
}
