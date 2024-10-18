import {
  PatchDocument,
  applyLessonPlanPatch,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { Message } from "ai";
import { createHash } from "crypto";
import { deepClone } from "fast-json-patch";

import { extractPatchesFromMessage } from "./extractPatches";

export class LessonPlanManager {
  private lessonPlan: LooseLessonPlan;
  private appliedPatchHashes: Set<string> = new Set();

  constructor(initialLessonPlan: LooseLessonPlan = {}) {
    this.lessonPlan = deepClone(initialLessonPlan);
  }

  public getLessonPlan(): LooseLessonPlan {
    return this.lessonPlan;
  }

  public applyPatchesFromMessage(message: Message): void {
    if (message.role === "assistant") {
      const { validPatches } = extractPatchesFromMessage(message);
      this.applyLocalPatches(validPatches);
    }
  }

  public updateFromServer(serverLessonPlan: LooseLessonPlan): void {
    this.lessonPlan = deepClone(serverLessonPlan);
    this.reset();
  }

  public reset(): void {
    this.appliedPatchHashes.clear();
  }

  public applyLocalPatches(patches: PatchDocument[]): void {
    patches.forEach((patch) => {
      const patchHash = this.generatePatchHash(patch);
      if (!this.appliedPatchHashes.has(patchHash)) {
        const updatedLessonPlan = applyLessonPlanPatch(this.lessonPlan, patch);
        if (updatedLessonPlan) {
          this.lessonPlan = deepClone(updatedLessonPlan);
          this.appliedPatchHashes.add(patchHash);
        }
      }
    });
  }

  private generatePatchHash(patch: PatchDocument): string {
    const patchString = JSON.stringify(patch);
    const hash = createHash("sha256");
    hash.update(patchString);
    return hash.digest("hex");
  }
}
