import type { LooseLessonPlan } from "../../protocol/schema";

export interface AilaRagFeature {
  fetchRagContent(params: {
    numberOfRecordsInRag?: number;
    lessonPlan?: LooseLessonPlan;
  }): Promise<string>;
}
