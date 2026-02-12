import { aiLogger } from "@oakai/logger";

import type { SlidesAgentResponse } from "../../schemas/plan";
import type { SimplifiedSlideContent } from "../utils";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// Internal types for vote collection
// ---------------------------------------------------------------------------

interface KeepVote {
  slideId: string;
  reasons: string[];
}

interface DeleteVote {
  klp: string;
  reasoning: string;
  slideId: string;
  supersededBySlides: number[];
}

// ---------------------------------------------------------------------------
// Reasoning merge
// ---------------------------------------------------------------------------

/**
 * Merges multiple KLP keep reasons for the same slide into a single
 * reasoning string.
 *
 * @param reasons - Array of reason strings from different KLP evaluations
 * @returns A consolidated reasoning string, or undefined if no reasons
 */
function mergeKeepReasons(reasons: string[]): string | undefined {
  const unique = [...new Set(reasons.filter((r) => r.length > 0))];
  if (unique.length === 0) return undefined;
  return unique.join("; ");
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------

/**
 * Reconciles per-KLP evaluation results into a single plan using
 * deterministic rules:
 *
 * 1. Collect votes — build keep and delete vote maps
 * 2. Any-keep rule — if ANY evaluation kept a slide, remove it from
 *    deletion candidates (O(1) Map lookup)
 * 3. Superseded validation — rescue deletions whose superseding slides
 *    are themselves being deleted
 * 4. Build final deletions with consolidated reasoning
 * 5. Derive keeps from complement of deletions, attaching reasoning
 *    from keep votes where available
 */
export function reconcileKlpResults(
  klpResults: { klp: string; result: SlidesAgentResponse }[],
  allSlides: SimplifiedSlideContent[],
): SlidesAgentResponse {
  // ── Step 1: Collect votes ────────────────────────────────────────────
  const keepVotesBySlide = new Map<number, KeepVote>();
  const deleteVotesBySlide = new Map<number, DeleteVote[]>();

  for (const { klp, result } of klpResults) {
    for (const kept of result.changes.slidesToKeep) {
      const existing = keepVotesBySlide.get(kept.slideNumber);
      if (existing) {
        if (kept.reasoning) existing.reasons.push(kept.reasoning);
      } else {
        keepVotesBySlide.set(kept.slideNumber, {
          slideId: kept.slideId,
          reasons: kept.reasoning ? [kept.reasoning] : [],
        });
      }
    }
    for (const del of result.changes.slideDeletions) {
      const existing = deleteVotesBySlide.get(del.slideNumber) ?? [];
      existing.push({
        klp,
        reasoning: del.reasoning ?? "",
        slideId: del.slideId,
        supersededBySlides: del.supersededBySlides ?? [],
      });
      deleteVotesBySlide.set(del.slideNumber, existing);
    }
  }

  log.info(
    "Reconciliation: %d slides kept by at least one evaluation, %d deletion candidates",
    keepVotesBySlide.size,
    deleteVotesBySlide.size,
  );

  // ── Step 2: Apply any-keep rule (O(1) Map lookup) ────────────────────
  const candidateDeletions = new Map<number, DeleteVote[]>();

  for (const [slideNumber, votes] of deleteVotesBySlide) {
    if (keepVotesBySlide.has(slideNumber)) {
      log.info(
        "  Slide %d: kept (any-keep rule — kept by another KLP evaluation)",
        slideNumber,
      );
    } else {
      candidateDeletions.set(slideNumber, votes);
    }
  }

  // ── Step 3: Superseded-by validation ─────────────────────────────────
  const deletionSet = new Set(candidateDeletions.keys());

  for (const [slideNumber, votes] of [...candidateDeletions]) {
    const allSuperseding = votes.flatMap((v) => v.supersededBySlides);
    const deletedSuperseding = allSuperseding.filter((n) =>
      deletionSet.has(n),
    );
    if (deletedSuperseding.length > 0) {
      log.info(
        "  Slide %d: rescued (superseding slide(s) %s also being deleted)",
        slideNumber,
        deletedSuperseding.join(", "),
      );
      deletionSet.delete(slideNumber);
      candidateDeletions.delete(slideNumber);
    }
  }

  // ── Step 4: Build final deletions ────────────────────────────────────
  const slideById = new Map<number, SimplifiedSlideContent>();
  for (const slide of allSlides) {
    slideById.set(slide.slideNumber, slide);
  }

  const slideDeletions = [...candidateDeletions.entries()].map(
    ([slideNumber, votes], idx) => ({
      slideNumber,
      slideId: votes[0]?.slideId ?? slideById.get(slideNumber)?.slideId ?? "",
      changeId: `sd-${slideNumber}-${idx + 1}`,
      reasoning: votes.map((v) => `[${v.klp}] ${v.reasoning}`).join("; "),
      supersededBySlides: [
        ...new Set(votes.flatMap((v) => v.supersededBySlides)),
      ],
    }),
  );

  // ── Step 5: Derive keeps from complement ─────────────────────────────
  const finalDeletionSet = new Set(slideDeletions.map((d) => d.slideNumber));

  const slidesToKeep = allSlides
    .filter((s) => !finalDeletionSet.has(s.slideNumber))
    .map((s) => {
      const keepVote = keepVotesBySlide.get(s.slideNumber);
      const reasoning = keepVote
        ? mergeKeepReasons(keepVote.reasons)
        : undefined;

      return {
        slideNumber: s.slideNumber,
        slideId: s.slideId,
        ...(reasoning !== undefined && { reasoning }),
      };
    });

  log.info(
    "Reconciliation complete: %d deletions, %d keeps",
    slideDeletions.length,
    slidesToKeep.length,
  );

  return {
    analysis: `Evaluated ${klpResults.length} KLP groups across ${allSlides.length} slides. ${slideDeletions.length} slides marked for deletion, ${slidesToKeep.length} kept.`,
    changes: {
      textEdits: [],
      tableCellEdits: [],
      textElementDeletions: [],
      slideDeletions,
      slidesToKeep,
    },
    reasoning: `Reconciled ${klpResults.length} KLP evaluations. Applied any-keep rule and superseded-by validation.`,
  };
}
