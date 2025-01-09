import { z } from "zod";

import { CompletedLessonPlanSchema } from "../../../aila/src/protocol/schema";
import type { DeepPartial, RagLessonPlanResult } from "../../types";

const databaseResponseSchema = z.object({
  ragLessonPlanId: z.string(),
  oakLessonId: z.number().nullable(),
  oakLessonSlug: z.string(),
  lessonPlan: CompletedLessonPlanSchema,
  matchedKey: z.string(),
  matchedValue: z.string(),
  distance: z.number(),
});

export const parseResult =
  (onError: (error: { ragLessonPlanId?: string; error: string }) => void) =>
  (result: DeepPartial<RagLessonPlanResult>): result is RagLessonPlanResult => {
    const parseResult = databaseResponseSchema.safeParse(result);
    if (parseResult.success) {
      return true;
    }

    onError({
      ragLessonPlanId: result.ragLessonPlanId,
      error: JSON.stringify(parseResult.error.errors),
    });
    return false;
  };
