import { LooseLessonPlan } from "../../../protocol/schema";
import { AilaCategorisationFeature } from "../../types";

export class MockCategoriser implements AilaCategorisationFeature {
  private _mockedLessonPlan: LooseLessonPlan | undefined;
  constructor({
    mockedLessonPlan,
  }: {
    mockedLessonPlan: LooseLessonPlan | undefined;
  }) {
    this._mockedLessonPlan = mockedLessonPlan;
  }
  public async categorise(): Promise<LooseLessonPlan | undefined> {
    return this._mockedLessonPlan;
  }
}
