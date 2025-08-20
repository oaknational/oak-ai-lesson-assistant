import { isTruthy } from "remeda";

import type { LooseLessonPlan } from "../../../protocol/schema";
import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";
import type { AilaCurrentTurn, AilaState } from "../types";

export function getRelevantRAGValues<ResponseType>({
  state,
  currentTurn,
  contentFromDocument,
}: {
  state: AilaState;
  currentTurn: AilaCurrentTurn;
  contentFromDocument: (
    document: LooseLessonPlan | RagLessonPlan,
  ) => ResponseType | undefined;
}): {
  basedOnContent: ResponseType | undefined;
  exemplarContent: ResponseType[];
  currentValue: ResponseType | undefined;
} {
  const exemplarContent =
    state.relevantLessons?.map(contentFromDocument).filter(isTruthy) ?? [];
  const basedOnLesson = state.relevantLessons?.find(
    (lesson) => lesson.id === currentTurn.document.basedOn?.id,
  );
  const basedOnContent = basedOnLesson
    ? contentFromDocument(basedOnLesson)
    : undefined;
  const currentValue = contentFromDocument(currentTurn.document);

  return {
    exemplarContent,
    basedOnContent,
    currentValue,
  };
}
