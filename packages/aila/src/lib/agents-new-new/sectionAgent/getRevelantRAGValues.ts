import { isTruthy } from "remeda";

import type { LooseLessonPlan } from "../../../protocol/schema";
import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import type { AilaExecutionContext } from "../types";

export function getRelevantRAGValues<ResponseType>({
  ctx,
  contentFromDocument,
}: {
  ctx: AilaExecutionContext;
  contentFromDocument: (
    document: LooseLessonPlan | RagLessonPlan,
  ) => ResponseType | undefined;
}): {
  basedOnContent: ResponseType | undefined;
  exemplarContent: ResponseType[];
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
