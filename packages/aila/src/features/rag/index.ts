import type { PartialLessonPlan } from "../../protocol/schema";

export interface AilaRagFeature {
  fetchRagContent(params: {
    numberOfRecordsInRag?: number;
    lessonPlan?: PartialLessonPlan;
  }): Promise<string>;
}
