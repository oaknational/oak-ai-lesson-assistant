import { isTruthy } from "remeda";

import type { LooseLessonPlan } from "../../../../protocol/schema";
import type { AilaExecutionContext } from "../../types";

export function getRelevantRAGValues<ResponseType>({
  ctx,
  contentFromDocument,
}: {
  ctx: AilaExecutionContext;
  contentFromDocument: (document: LooseLessonPlan) => ResponseType | undefined;
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
      ?.map(contentFromDocument)
      .filter(isTruthy) ?? [];

  console.log("based on id ", ctx.currentTurn.document.basedOn?.id);
  console.log(
    "relevant lessons ",
    ctx.persistedState.relevantLessons
      ?.map((lesson) => lesson.ragLessonPlanId)
      .join("\n- "),
  );
  const basedOnLesson = ctx.persistedState.relevantLessons?.find(
    (lesson) =>
      lesson.ragLessonPlanId?.toString() ===
      ctx.currentTurn.document.basedOn?.id,
  );
  const basedOnContent = basedOnLesson
    ? contentFromDocument(basedOnLesson.lessonPlan)
    : undefined;
  const currentValue = contentFromDocument(ctx.currentTurn.document);

  return {
    exemplarContent,
    basedOnContent,
    currentValue,
  };
}
