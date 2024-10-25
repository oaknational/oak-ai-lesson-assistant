import { LooseLessonPlan } from "../../protocol/schema";

export interface AilaRagFeature {
  fetchRagContent(params: {
    numberOfLessonPlansInRag?: number;
    lessonPlan?: LooseLessonPlan;
  }): Promise<string>;
}
