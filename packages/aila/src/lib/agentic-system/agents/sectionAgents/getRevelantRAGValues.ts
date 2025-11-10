import { isTruthy } from "remeda";

import type { PartialLessonPlan } from "../../../../protocol/schema";
import type { RagLessonPlan } from "../../../../utils/rag/fetchRagContent";
import type { AilaExecutionContext } from "../../types";

export function getRelevantRAGValues<ResponseType>({
  ctx,
  contentFromDocument,
}: {
  ctx: AilaExecutionContext;
  contentFromDocument: (
    document: PartialLessonPlan | RagLessonPlan,
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
      ?.map(contentFromDocument)
      .filter(isTruthy) ?? [];
  const basedOnLesson = ctx.persistedState.relevantLessons?.find(
    (lesson) => lesson.id === ctx.currentTurn.document.basedOn?.id,
  );
  const basedOnContent = basedOnLesson
    ? contentFromDocument(basedOnLesson)
    : undefined;
  const currentValue = contentFromDocument(ctx.currentTurn.document);

  return {
    exemplarContent,
    basedOnContent,
    currentValue,
  };
}
