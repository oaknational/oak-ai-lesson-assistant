import { CompletedLessonPlanSchema } from "@oakai/aila/src/protocol/schema";

import { IngestError } from "../IngestError";
import { CompletionBatchResponseSchema } from "../zod-schema/zodSchema";
import { parseKeyStage } from "./parseKeyStage";

export function parseBatchLessonPlan(line: unknown) {
  let result;
  try {
    result = CompletionBatchResponseSchema.parse(line);
  } catch (cause) {
    throw new IngestError("Failed to extract lesson plan from response", {
      errorDetail: line,
      cause,
    });
  }
  const { custom_id: lessonId } = result;

  if (result.error) {
    throw new IngestError("Failed to generate lesson plan", {
      errorDetail: result,
      lessonId,
    });
  }

  const maybeLessonPlanString =
    result.response.body.choices?.[0]?.message?.content;

  if (!maybeLessonPlanString) {
    throw new IngestError("Failed to extract lesson plan from response", {
      errorDetail: result,
      lessonId,
    });
  }

  let lessonPlan;
  try {
    lessonPlan = CompletedLessonPlanSchema.parse(
      JSON.parse(maybeLessonPlanString),
    );

    lessonPlan.keyStage = parseKeyStage(lessonPlan.keyStage);
  } catch (cause) {
    throw new IngestError("Failed to parse lesson plan", {
      cause,
      lessonId,
      errorDetail: maybeLessonPlanString,
    });
  }

  // hack to remove basedOn as it often erroneously gets populated by LLM
  delete lessonPlan.basedOn;

  return { lessonPlan, lessonId };
}
