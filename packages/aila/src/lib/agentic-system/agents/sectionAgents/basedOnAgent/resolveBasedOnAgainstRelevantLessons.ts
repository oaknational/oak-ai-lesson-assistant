import type { BasedOn } from "../../../../../protocol/schema";
import type { AgenticRagLessonPlanResult } from "../../../types";

// The LLM can mislabel basedOn (e.g. "use lesson 1 and rename it to X" puts
// the new title in basedOn.title), so resolve it against the offered lessons.
export function resolveBasedOnAgainstRelevantLessons(
  basedOn: BasedOn,
  relevantLessons: AgenticRagLessonPlanResult[] | null,
): BasedOn {
  if (!relevantLessons?.length) return basedOn;

  const byId = relevantLessons.find((l) => l.ragLessonPlanId === basedOn.id);
  if (byId) {
    return { id: byId.ragLessonPlanId, title: byId.lessonPlan.title };
  }

  const byTitle = relevantLessons.find(
    (l) => l.lessonPlan.title.toLowerCase() === basedOn.title.toLowerCase(),
  );
  if (byTitle) {
    return { id: byTitle.ragLessonPlanId, title: byTitle.lessonPlan.title };
  }

  return basedOn;
}
