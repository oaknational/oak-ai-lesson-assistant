import {
  PatchDocument,
  applyLessonPlanPatch,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { Message } from "ai";
import { createHash } from "crypto";
import { EventEmitter } from "events";
import { deepClone } from "fast-json-patch";

import { extractPatchesFromMessage } from "./extractPatches";

const log = aiLogger("lessons");

export class LessonPlanManager {
  private lessonPlan: LooseLessonPlan;
  private appliedPatchHashes: Set<string> = new Set();
  private eventEmitter: EventEmitter = new EventEmitter();
  private iteration: number | undefined;

  constructor(initialLessonPlan: LooseLessonPlan = {}) {
    this.lessonPlan = deepClone(initialLessonPlan);
  }

  public getLessonPlan(): LooseLessonPlan {
    return this.lessonPlan;
  }

  public setLessonPlan(
    newLessonPlan: LooseLessonPlan,
    newIteration: number | undefined,
  ): void {
    if (
      newIteration === undefined ||
      this.iteration === undefined ||
      newIteration > this.iteration
    ) {
      const currentKeys = Object.keys(this.lessonPlan).filter(
        (k) => this.lessonPlan[k],
      );
      const newKeys = Object.keys(newLessonPlan).filter(
        (k) => newLessonPlan[k],
      );
      log.info("Updating lesson plan from server", {
        iteration: this.iteration,
        newIteration,
        keys: newKeys.length,
        currentKeys: currentKeys.join("|"),
        newKeys: newKeys.join("|"),
      });
      if (newKeys.length < currentKeys.length) {
        log.warn(
          `New lesson plan has fewer keys than current lesson plan: ${newKeys.length} < ${currentKeys.length}`,
        );
      }
      this.lessonPlan = deepClone(newLessonPlan);
      this.iteration = newIteration;
      this.emitLessonPlan();
    } else {
      log.info(
        `LessonPlanManager: Skipping setting lesson plan with iteration ${newIteration} because current iteration is ${this.iteration}`,
      );
    }
  }

  private emitLessonPlan = (): void => {
    this.eventEmitter.emit("lessonPlanUpdated", {
      lessonPlan: this.lessonPlan,
      iteration: this.iteration,
    });
  };

  public setLessonPlanWithDelay(
    newLessonPlan: LooseLessonPlan,
    iteration: number | undefined,
    delay: number = 2000,
  ): void {
    const keys = Object.keys(newLessonPlan).filter((k) => newLessonPlan[k]);
    log.info("Delay setting lesson plan", `${keys.length}`, keys.join("|"));
    setTimeout(() => {
      this.setLessonPlan(newLessonPlan, iteration);
    }, delay);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  public onMessageUpdated(message: Message): void {
    if (message.role === "assistant") {
      this.applyPatches(message);
    }
  }

  private applyPatches(message: Message): void {
    const { validPatches } = extractPatchesFromMessage(message);
    let patchesApplied = false;
    validPatches.forEach((patch) => {
      const patchHash = this.generatePatchHash(patch);
      if (!this.appliedPatchHashes.has(patchHash)) {
        const startTime = performance.now();
        const updatedLessonPlan = applyLessonPlanPatch(this.lessonPlan, patch);
        const endTime = performance.now();
        log.info(
          `applyLessonPlanPatch took ${endTime - startTime} milliseconds`,
        );
        if (updatedLessonPlan) {
          log.info("Applied patch", patch.value.path);
          this.lessonPlan = deepClone(updatedLessonPlan);
          this.appliedPatchHashes.add(patchHash);
          patchesApplied = true;
        }
      }
    });

    if (patchesApplied) {
      this.emitLessonPlan();
    }
  }

  private generatePatchHash(patch: PatchDocument): string {
    const patchString = JSON.stringify(patch);
    const hash = createHash("sha256");
    hash.update(patchString);
    return hash.digest("hex");
  }
}
