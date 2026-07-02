import type { Cycle } from "../../../../protocol/schema";
import type { SectionKey } from "../../schema";
import type { AilaExecutionContext } from "../../types";

export const CYCLE_SECTION_KEYS = ["cycle1", "cycle2", "cycle3"] as const;
export type CycleSectionKey = (typeof CYCLE_SECTION_KEYS)[number];

export function cycleTargetPromptPart(
  ctx: AilaExecutionContext,
): string | null {
  const sectionKey = ctx.currentTurn.currentStep?.sectionKey;
  if (!isCycleSectionKey(sectionKey)) return null;

  const cycleIndex = CYCLE_SECTION_KEYS.indexOf(sectionKey);
  const learningCycles = ctx.currentTurn.document.learningCycles ?? [];
  const targetOutcome = learningCycles[cycleIndex];
  const previousCycles = CYCLE_SECTION_KEYS.slice(0, cycleIndex)
    .map((key, index) =>
      summariseCycle(key, index, ctx.currentTurn.document[key] ?? undefined),
    )
    .filter(Boolean);
  const laterOutcomes = CYCLE_SECTION_KEYS.slice(cycleIndex + 1)
    .map((key, i) => ({
      sectionKey: key,
      outcome: learningCycles[cycleIndex + 1 + i],
    }))
    .filter(({ outcome }) => Boolean(outcome));

  return `## Target learning cycle

You are generating ${sectionKey}, learning cycle ${cycleIndex + 1}.

Target learning cycle outcome:
${targetOutcome ? `- ${targetOutcome}` : "- No matching learning cycle outcome was found. Use the current document carefully and do not invent a different lesson focus."}

Rules for this cycle:
- Generate only ${sectionKey}.
- This cycle must directly teach and practise the target learning cycle outcome above.
- Do not repeat the explanation, checks for understanding, practice task, or feedback from earlier cycles.
- Do not teach content reserved for later learning cycle outcomes, except for brief prerequisite links.
- If previous cycles are listed below, use them as context for progression and contrast.

Previous completed cycles:
${previousCycles.length > 0 ? previousCycles.join("\n") : "- None"}

Later learning cycle outcomes to reserve:
${laterOutcomes.length > 0 ? laterOutcomes.map(({ sectionKey, outcome }) => `- ${sectionKey}: ${outcome}`).join("\n") : "- None"}`;
}

export function isCycleSectionKey(
  sectionKey: SectionKey | undefined,
): sectionKey is CycleSectionKey {
  return CYCLE_SECTION_KEYS.some((k) => k === sectionKey);
}

function summariseCycle(
  sectionKey: CycleSectionKey,
  index: number,
  cycle: Cycle | undefined,
): string | null {
  if (!cycle) return null;

  const checks =
    cycle.checkForUnderstanding
      ?.map((question) => question.question)
      .filter(Boolean)
      .join(" | ") || "No checks recorded";

  return [
    `- ${sectionKey}, learning cycle ${index + 1}`,
    `  Title: ${cycle.title}`,
    `  Practice: ${cycle.practice}`,
    `  Checks: ${checks}`,
  ].join("\n");
}
