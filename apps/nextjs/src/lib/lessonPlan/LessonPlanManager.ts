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

  constructor(initialLessonPlan: LooseLessonPlan = {}) {
    this.lessonPlan = deepClone(initialLessonPlan);
  }

  public getLessonPlan(): LooseLessonPlan {
    return this.lessonPlan;
  }

  public setLessonPlan(newLessonPlan: LooseLessonPlan): void {
    this.lessonPlan = deepClone(newLessonPlan);
    this.eventEmitter.emit("lessonPlanUpdated", this.lessonPlan);
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

  private throttledApplyPatches = throttle(this.applyPatches.bind(this), 500);

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
      this.eventEmitter.emit("lessonPlanUpdated", this.lessonPlan);
    }
  }

  private generatePatchHash(patch: PatchDocument): string {
    const patchString = JSON.stringify(patch);
    const hash = createHash("sha256");
    hash.update(patchString);
    return hash.digest("hex");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): T {
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return ((...args: Parameters<T>) => {
    lastArgs = args;
    if (!timeoutId) {
      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
        timeoutId = null;
      }, delay);
    }
  }) as T;
}
