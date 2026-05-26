import { aiLogger } from "@oakai/logger";

import type { SlidesAgentResponse } from "../../schemas/plan";
import type { SimplifiedSlideContent } from "../utils";
import { callSlidesAgent } from "./batching";
import type { IntentConfig, KlpBatchedProcessingConfig } from "./intents";
import { reconcileKlpResults } from "./reconciliation";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// KLP Grouping
// ---------------------------------------------------------------------------

const UNATTACHED_KEY = "__unattached__";

/**
 * Groups slides by the KLPs they cover.
 * A slide covering multiple KLPs appears in multiple groups.
 * Slides with no KLPs go into the "__unattached__" group.
 */
export function groupSlidesByKlp(
  slides: Pick<SimplifiedSlideContent, "slideNumber" | "keyLearningPoints">[],
): Map<string, number[]> {
  const klpToSlides = new Map<string, number[]>();
  const unattached: number[] = [];

  for (const slide of slides) {
    const klps = slide.keyLearningPoints ?? [];
    if (klps.length === 0) {
      unattached.push(slide.slideNumber);
    } else {
      for (const klp of klps) {
        const existing = klpToSlides.get(klp) ?? [];
        existing.push(slide.slideNumber);
        klpToSlides.set(klp, existing);
      }
    }
  }

  if (unattached.length > 0) {
    klpToSlides.set(UNATTACHED_KEY, unattached);
  }

  return klpToSlides;
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

function isKlpBatchedConfig(
  config: IntentConfig,
): config is KlpBatchedProcessingConfig {
  return config.processingMode === "klpBatched";
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

/**
 * Generates a slide plan using KLP-batched processing.
 *
 * This approach:
 * 1. Groups slides by the KLPs they cover
 * 2. Evaluates each KLP group in parallel via callSlidesAgent
 * 3. Reconciles results deterministically (any-keep rule + KLP coverage check)
 * 4. Returns a unified plan with per-deletion reasoning
 */
export async function generateKlpBatchedSlidePlan(
  config: IntentConfig,
  filteredSlides: SimplifiedSlideContent[],
  userMessage: string,
): Promise<SlidesAgentResponse | undefined> {
  if (!isKlpBatchedConfig(config)) {
    throw new Error(
      "generateKlpBatchedSlidePlan called with non-klpBatched config",
    );
  }

  // Split slides into protected (excluded from deletion evaluation) and evaluatable
  const protectedSlides: SimplifiedSlideContent[] = [];
  const evaluatableSlides: SimplifiedSlideContent[] = [];
  for (const slide of filteredSlides) {
    if (config.protectedSlideTypes?.includes(slide.slideType ?? "")) {
      protectedSlides.push(slide);
    } else {
      evaluatableSlides.push(slide);
    }
  }

  const klpToSlides = groupSlidesByKlp(evaluatableSlides);

  log.info("=== KLP-BATCHED PROCESSING START ===");
  log.info(
    "Input: %d slides (%d protected, %d evaluatable), %d KLP groups",
    filteredSlides.length,
    protectedSlides.length,
    evaluatableSlides.length,
    klpToSlides.size,
  );
  if (protectedSlides.length > 0) {
    log.info(
      "  Protected slides: [%s]",
      protectedSlides
        .map((s) => `${s.slideNumber} (${s.slideType ?? "unknown"})`)
        .join(", "),
    );
  }
  for (const [klp, slideNums] of klpToSlides.entries()) {
    log.info("  KLP group %s → slides [%s]", klp, slideNums.join(", "));
  }

  // Build slide lookup
  const slideByNumber = new Map<number, SimplifiedSlideContent>();
  for (const slide of evaluatableSlides) {
    slideByNumber.set(slide.slideNumber, slide);
  }

  // Evaluate all KLP groups in parallel
  const klpEntries = [...klpToSlides.entries()];
  const results = await Promise.allSettled(
    klpEntries.map(async ([klp, slideNumbers]) => {
      const klpSlides = slideNumbers
        .map((n) => slideByNumber.get(n))
        .filter((s): s is SimplifiedSlideContent => s !== undefined);

      log.info("  Evaluating KLP group %s: %d slides", klp, klpSlides.length);

      if (klpSlides.length === 0) return { klp, result: undefined };

      const result = await callSlidesAgent(
        config,
        "removeNonEssentialContent",
        userMessage,
        klpSlides,
      );
      return { klp, result };
    }),
  );

  // Collect successful results
  const klpResults: { klp: string; result: SlidesAgentResponse }[] = [];
  for (const [idx, r] of results.entries()) {
    const klp = klpEntries[idx]![0];
    if (r.status === "fulfilled" && r.value.result) {
      klpResults.push({ klp, result: r.value.result });
      log.info(
        "  KLP %s: %d deletions, %d keeps",
        klp,
        r.value.result.changes.slideDeletions.length,
        r.value.result.changes.slidesToKeep.length,
      );
    } else if (r.status === "rejected") {
      log.error("  KLP %s evaluation failed: %s", klp, r.reason);
    } else {
      log.warn("  KLP %s evaluation returned no output", klp);
    }
  }

  if (klpResults.length === 0) {
    log.error("All KLP evaluations failed");
    return undefined;
  }

  // Reconcile results deterministically
  const reconciled = reconcileKlpResults(klpResults, evaluatableSlides);

  // Add protected slides to keeps
  const protectedKeeps = protectedSlides.map((s) => ({
    slideNumber: s.slideNumber,
    slideId: s.slideId,
    reasoning: "Slide in protected list and not analysed",
  }));
  reconciled.changes.slidesToKeep = [
    ...protectedKeeps,
    ...reconciled.changes.slidesToKeep,
  ];

  log.info(
    "Final output: %d deletions, %d keeps (%d protected + %d from reconciliation)",
    reconciled.changes.slideDeletions.length,
    reconciled.changes.slidesToKeep.length,
    protectedKeeps.length,
    reconciled.changes.slidesToKeep.length - protectedKeeps.length,
  );
  log.info("=== KLP-BATCHED PROCESSING END ===");

  return reconciled;
}
