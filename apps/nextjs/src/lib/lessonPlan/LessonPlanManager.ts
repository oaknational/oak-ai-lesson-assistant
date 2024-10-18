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
      console.log("Applying patches from message", message.content);
      const { validPatches } = extractPatchesFromMessage(message);
      this.applyLocalPatches(validPatches);
    }
  }

  public updateFromServer(serverLessonPlan: LooseLessonPlan): void {
    // Update existing keys and add new ones
    Object.keys(serverLessonPlan).forEach((key) => {
      this.lessonPlan[key] = deepClone(serverLessonPlan[key]);
    });

    // Remove keys that are no longer in serverLessonPlan
    Object.keys(this.lessonPlan).forEach((key) => {
      if (!(key in serverLessonPlan)) {
        delete this.lessonPlan[key];
      }
    });
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
          this.lessonPlan = updatedLessonPlan;
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
