import { isTruthy } from "remeda";

import type { PartialLessonPlan } from "../../../../protocol/schema";
import type { AilaExecutionContext } from "../../types";

export function getRelevantRAGValues<ResponseType>({
  ctx,
  contentFromDocument,
}: {
  ctx: AilaExecutionContext;
  contentFromDocument: (
    document: PartialLessonPlan,
    ctx: AilaExecutionContext,
  ) => ResponseType | undefined;
}): {
  /**
   * Relevant section value extracted from the document that the lesson being planned is based on.
   */
  basedOnContent: ResponseType | undefined;
  /**
   * Relevant section value extracted from similar lessons deemed 'relevant' to the lesson being planned
   */
  exemplarContent: ResponseType[];
  /**
   * Relevant section value extracted in the lesson being planned.
   */
  currentValue: ResponseType | undefined;
} {
  const exemplarContent =
    ctx.persistedState.relevantLessons
      ?.map((lesson) => lesson.lessonPlan)
      ?.map((document) => contentFromDocument(document, ctx))
      .filter(isTruthy) ?? [];

  const basedOnLesson = ctx.persistedState.relevantLessons?.find(
    (lesson) => lesson.ragLessonPlanId === ctx.currentTurn.document.basedOn?.id,
  );
  const basedOnContent = basedOnLesson
    ? contentFromDocument(basedOnLesson.lessonPlan, ctx)
    : undefined;
  const currentValue = contentFromDocument(ctx.currentTurn.document, ctx);

  return {
    exemplarContent,
    basedOnContent,
    currentValue,
  };
}
