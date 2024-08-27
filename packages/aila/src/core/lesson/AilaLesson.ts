import { deepClone } from "fast-json-patch";

import {
  PatchDocument,
  applyLessonPlanPatch,
  extractPatches,
} from "../../protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "../../protocol/schema";
import { AilaLessonService } from "../AilaServices";

export class AilaLesson implements AilaLessonService {
  private _plan: LooseLessonPlan;
  private _hasSetInitialState = false;
  private _appliedPatches: PatchDocument[] = [];
  private _invalidPatches: PatchDocument[] = [];

  constructor({ lessonPlan }: { lessonPlan?: LooseLessonPlan }) {
    this._plan = lessonPlan ?? {};
  }

  public get plan(): LooseLessonPlan {
    return this._plan;
  }

  public set plan(plan: LooseLessonPlan) {
    this._plan = plan;
  }

  public get hasSetInitialState(): boolean {
    return this._hasSetInitialState;
  }

  public set hasSetInitialState(value: boolean) {
    this._hasSetInitialState = value;
  }

  public initialise(plan: LooseLessonPlan) {
    const shouldSetInitialState = Boolean(
      plan.title && plan.keyStage && plan.subject,
    );
    if (shouldSetInitialState) {
      this._plan = {
        title: plan.title ?? "Untitled",
        subject: plan.subject ?? "No subject",
        keyStage: plan.keyStage ?? "No keystage",
        topic: plan.topic ?? undefined,
      };
      this._hasSetInitialState = true;
    }
  }

  public applyPatches(patches: string) {
    let workingLessonPlan = deepClone(this._plan);

    // TODO do we need to apply all patches even if they are partial?
    const { validDocuments, partialDocuments } = extractPatches(patches, 100);
    for (const patch of partialDocuments) {
      this._invalidPatches.push(patch);
    }

    for (const patch of validDocuments) {
      const newWorkingLessonPlan = applyLessonPlanPatch(
        workingLessonPlan,
        patch,
      );
      if (newWorkingLessonPlan) {
        workingLessonPlan = newWorkingLessonPlan;
      }
    }

    for (const patch of validDocuments) {
      this._appliedPatches.push(patch);
    }

    this._plan = workingLessonPlan;
  }
}
