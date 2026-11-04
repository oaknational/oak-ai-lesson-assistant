import { aiLogger } from "@oakai/logger";

import { deepClone } from "fast-json-patch";

import type { ValidPatchDocument } from "../../protocol/jsonPatchProtocol";
import {
  applyLessonPlanPatch,
  extractPatches,
} from "../../protocol/jsonPatchProtocol";
import type { PartialLessonPlan } from "../../protocol/schema";
import type { AilaDocumentService } from "../AilaServices";
import type { AilaDocumentContent } from "./types";

const log = aiLogger("aila:lesson");

export class AilaDocument implements AilaDocumentService {
  private _content: AilaDocumentContent;
  private readonly _appliedPatches: ValidPatchDocument[] = [];
  private readonly _invalidPatches: ValidPatchDocument[] = [];

  constructor({ content }: { content?: PartialLessonPlan }) {
    log.info("Creating AilaDocument");
    this._content = content ?? {};
  }

  public get content(): AilaDocumentContent {
    return this._content;
  }

  public set content(content: AilaDocumentContent) {
    this._content = content;
  }

  public applyValidPatches(validPatches: ValidPatchDocument[]) {
    let workingLessonPlan = deepClone(this._content) as PartialLessonPlan;
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
}
