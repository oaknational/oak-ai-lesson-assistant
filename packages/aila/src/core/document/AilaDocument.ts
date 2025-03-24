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
import type { AilaDocumentService, AilaServices } from "../AilaServices";
import type { Message } from "../chat";
import type { AilaDocumentContent } from "./types";

const log = aiLogger("aila:lesson");

function logChangedKeys<T extends object>(state: T, prevState: T) {
  const changedKeys = Object.keys(state)
    .filter((key) => state[key] !== prevState[key])
    .map((key) => {
      const value = state[key];
      if (value && typeof value === "object") {
        const prevValue = prevState[key] || {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const changedKeys = Object.keys(value).filter(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (key) => value[key] !== prevValue[key],
        );
        return `/${key}/{${changedKeys.join(",")}}`;
      }

      return `/${key}`;
    });

  log.info(`Changed keys: ${changedKeys.join(", ") || "None"}`);
}

export class AilaDocument implements AilaDocumentService {
  private readonly _aila: AilaServices;
  private _content: AilaDocumentContent;
  private _hasInitialisedContentFromMessages = false;
  private readonly _appliedPatches: ValidPatchDocument[] = [];
  private readonly _invalidPatches: ValidPatchDocument[] = [];
  private readonly _categoriser: AilaCategorisationFeature;

  constructor({
    aila,
    content,
    categoriser,
  }: {
    aila: AilaServices;
    content?: LooseLessonPlan;
    categoriser?: AilaCategorisationFeature;
  }) {
    log.info("Creating AilaDocument");
    this._aila = aila;
    this._content = content ?? {};
    this._categoriser =
      categoriser ??
      new AilaCategorisation({
        aila,
      });
  }

  public get content(): AilaDocumentContent {
    return this._content;
  }

  public set content(content: AilaDocumentContent) {
    this._content = content;
  }

  public get hasInitialisedContentFromMessages(): boolean {
    return this._hasInitialisedContentFromMessages;
  }

  public initialise(plan: LooseLessonPlan) {
    const shouldSetInitialState = Boolean(
      plan.title && plan.keyStage && plan.subject,
    );
    if (shouldSetInitialState) {
      this._content = {
        title: plan.title ?? "Untitled",
        subject: plan.subject ?? "No subject",
        keyStage: plan.keyStage ?? "No keystage",
        topic: plan.topic ?? undefined,
      };
      this._hasInitialisedContentFromMessages = true;
    }
  }

  public applyValidPatches(validPatches: ValidPatchDocument[]) {
    let workingLessonPlan = deepClone(this._content) as LooseLessonPlan;
    const beforeState = workingLessonPlan;
    log.info(
      "Applying patches",
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

    logChangedKeys(beforeState, workingLessonPlan);

    this._content = workingLessonPlan;
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

  public async initialiseContentFromMessages(messages: Message[]) {
    log.info("Initialise content based on messages", this._content.title);
    const shouldCategoriseBasedOnInitialMessages = Boolean(
      !this._content.subject && !this._content.keyStage && !this._content.title,
    );

    // The initial lesson plan is blank, so we take the first messages
    // and attempt to deduce the lesson plan key stage, subject, title and topic
    if (shouldCategoriseBasedOnInitialMessages) {
      const result = await this._categoriser.categorise(
        messages,
        this._content,
      );

      if (result) {
        this.initialise(result);
      }
    }
  }
}
