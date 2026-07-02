import type { PartialLessonPlan } from "../../../protocol/schema";
import type { PlanStep, SectionKey } from "../schema";

const GROUP_4_ORDER = [
  "starterQuiz",
  "cycle1",
  "cycle2",
  "cycle3",
  "exitQuiz",
] as const satisfies readonly SectionKey[];

const GROUP_4_ORDER_INDEX = new Map<SectionKey, number>(
  GROUP_4_ORDER.map((sectionKey, index) => [sectionKey, index]),
);

export function normalisePlanSteps(
  plan: PlanStep[],
  document: PartialLessonPlan,
): PlanStep[] {
  const group4Steps = plan
    .filter((step) => isGroup4Section(step.sectionKey))
    .filter((step) => shouldKeepStep(step, document))
    .sort(
      (a, b) =>
        GROUP_4_ORDER_INDEX.get(a.sectionKey)! -
        GROUP_4_ORDER_INDEX.get(b.sectionKey)!,
    );

  if (group4Steps.length === 0) {
    return plan.filter((step) => shouldKeepStep(step, document));
  }

  let group4Inserted = false;

  return plan.flatMap((step) => {
    if (!isGroup4Section(step.sectionKey)) return [step];
    if (group4Inserted) return [];

    group4Inserted = true;
    return group4Steps;
  });
}

export function getCycleOutcomeForSection(
  document: PartialLessonPlan,
  sectionKey: SectionKey,
): string | undefined {
  const cycleIndex = getCycleIndex(sectionKey);
  if (cycleIndex === null) return undefined;

  return document.learningCycles?.[cycleIndex];
}

function shouldKeepStep(step: PlanStep, document: PartialLessonPlan): boolean {
  const lcLength = document.learningCycles?.length ?? 0;
  if (step.sectionKey === "cycle3") return lcLength >= 3;
  if (step.sectionKey === "cycle2") return lcLength >= 2;
  return true;
}

function isGroup4Section(
  sectionKey: SectionKey,
): sectionKey is (typeof GROUP_4_ORDER)[number] {
  return GROUP_4_ORDER_INDEX.has(sectionKey);
}

export function getCycleIndex(sectionKey: SectionKey): number | null {
  switch (sectionKey) {
    case "cycle1":
      return 0;
    case "cycle2":
      return 1;
    case "cycle3":
      return 2;
    default:
      return null;
  }
}
