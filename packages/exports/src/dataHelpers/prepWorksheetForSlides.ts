import type { WorksheetSlidesInputData } from "../schema/input.schema";

export async function prepWorksheetForSlides(
  lessonPlan: Pick<
    WorksheetSlidesInputData,
    "title" | "cycle1" | "cycle2" | "cycle3"
  >,
) {
  return Promise.resolve({
    lesson_title: lessonPlan.title,
    learning_cycle_title_1: lessonPlan.cycle1.title ?? " ",
    practice_task_1: lessonPlan.cycle1.practice ?? " ",
    learning_cycle_title_2: lessonPlan?.cycle2?.title ?? " ",
    practice_task_2: lessonPlan?.cycle2?.practice ?? " ",
    learning_cycle_title_3: lessonPlan?.cycle3?.title ?? " ",
    practice_task_3: lessonPlan?.cycle3?.practice ?? " ",
  });
}
