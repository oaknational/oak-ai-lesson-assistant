import { aiLogger } from "@oakai/logger";
import { deepClone } from "fast-json-patch";

import { AilaCategorisation } from "../../features/categorisation/categorisers/AilaCategorisation";
import type { AilaCategorisationFeature } from "../../features/types";
import type { ValidPatchDocument } from "../../protocol/jsonPatchProtocol";
import {
  applyLessonPlanPatch,
  extractPatches,
} from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../protocol/schema";
import type { AilaLessonService, AilaServices } from "../AilaServices";
import type { Message } from "../chat";

const log = aiLogger("aila:lesson");

export class AilaLesson implements AilaLessonService {
  private _aila: AilaServices;
  private _plan: LooseLessonPlan;
  private _hasSetInitialState = false;
  private _appliedPatches: ValidPatchDocument[] = [];
  private _invalidPatches: ValidPatchDocument[] = [];
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
    log.info("Creating AilaLesson", lessonPlan?.title);
    this._aila = aila;
    this._plan = lessonPlan ?? {};
    this._categoriser =
      categoriser ??
      new AilaCategorisation({
        aila,
      });
  }

  public get plan(): LooseLessonPlan {
    return this._plan;
  }

  public set plan(plan: LooseLessonPlan) {
    this._plan = plan;
  }

  public setPlan(plan: LooseLessonPlan) {
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

  public applyValidPatches(validPatches: ValidPatchDocument[]) {
    let workingLessonPlan = deepClone(this._plan) as LooseLessonPlan;
    const beforeKeys = Object.entries(workingLessonPlan)
      .filter(([, v]) => v)
      .map(([k]) => k);
    log.info(
      "Apply patches: Lesson state before:",
      `${beforeKeys.length} keys`,
      beforeKeys.join("|"),
    );
    log.info(
      "Attempting to apply patches",
      validPatches
        .map((p) => [p.value.op, p.value.path])
        .flat()
        .join(","),
    );
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
      log.info("Applied patch", patch.value.path);
    }

    const afterKeys = Object.entries(workingLessonPlan)
      .filter(([, v]) => v)
      .map(([k]) => k);
    log.info(
      "Apply patches: Lesson state after:",
      `${afterKeys.length} keys`,
      afterKeys.join("|"),
    );

    this._plan = workingLessonPlan;
  }

  public extractAndApplyLlmPatches(patches: string) {
    // TODO do we need to apply all patches even if they are partial?
    const { validPatches, partialPatches } = extractPatches(patches);
    for (const patch of partialPatches) {
      this._invalidPatches.push(patch);
    }

    if (this._invalidPatches.length > 0) {
      // This should never occur server-side. If it does, we should log it.
      log.warn("Invalid patches found. Not applying", this._invalidPatches);
    }

    this.applyValidPatches(validPatches);
  }

  public async setUpInitialLessonPlan(messages: Message[]) {
    log.info("Setting up initial lesson plan", this._plan.title);
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
