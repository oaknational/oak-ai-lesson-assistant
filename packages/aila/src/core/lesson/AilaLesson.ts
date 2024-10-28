import { deepClone } from "fast-json-patch";

import { AilaCategorisation } from "../../features/categorisation/categorisers/AilaCategorisation";
import type { AilaCategorisationFeature } from "../../features/types";
import type {
  PatchDocument} from "../../protocol/jsonPatchProtocol";
import {
  applyLessonPlanPatch,
  extractPatches,
} from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../protocol/schema";
import type { AilaLessonService, AilaServices } from "../AilaServices";
import type { Message } from "../chat";

export class AilaLesson implements AilaLessonService {
  private _aila: AilaServices;
  private _plan: LooseLessonPlan;
  private _hasSetInitialState = false;
  private _appliedPatches: PatchDocument[] = [];
  private _invalidPatches: PatchDocument[] = [];
  private _categoriser: AilaCategorisationFeature;

  constructor({
    aila,
    lessonPlan,
    categoriser,
  }: {
    aila: AilaServices;
    lessonPlan?: LooseLessonPlan;
    categoriser?: AilaCategorisationFeature;
  }) {
    this._aila = aila;
    this._plan = lessonPlan ?? {};
    this._categoriser =
      categoriser ??
      new AilaCategorisation({
        aila: this._aila,
      });
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
    const { validPatches, partialPatches } = extractPatches(patches, 100);
    for (const patch of partialPatches) {
      this._invalidPatches.push(patch);
    }

    for (const patch of validPatches) {
      const newWorkingLessonPlan = applyLessonPlanPatch(
        workingLessonPlan,
        patch,
      );
      if (newWorkingLessonPlan) {
        workingLessonPlan = newWorkingLessonPlan;
      }
    }

    for (const patch of validPatches) {
      this._appliedPatches.push(patch);
    }

    this._plan = workingLessonPlan;
  }

  public async setUpInitialLessonPlan(messages: Message[]) {
    const shouldCategoriseBasedOnInitialMessages = Boolean(
      !this._plan.subject && !this._plan.keyStage && !this._plan.title,
    );

    // The initial lesson plan is blank, so we take the first messages
    // and attempt to deduce the lesson plan key stage, subject, title and topic
    if (shouldCategoriseBasedOnInitialMessages) {
      const result = await this._categoriser.categorise(messages, this._plan);

      if (result) {
        this.initialise(result);
      }
    }
  }
}
