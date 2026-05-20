import type { SectionAgentId, SectionStep } from "../../schema";

const SECTION_AGENT_MAP_DEFAULTS: Record<
  SectionStep["sectionKey"],
  SectionAgentId
> = {
  subject: "subject--default",
  keyStage: "keyStage--default",
  title: "title--default",
  basedOn: "basedOn--default",
  learningOutcome: "learningOutcome--default",
  learningCycles: "learningCycleOutcomes--default",
  priorKnowledge: "priorKnowledge--default",
  keyLearningPoints: "keyLearningPoints--default",
  misconceptions: "misconceptions--default",
  keywords: "keywords--default",
  starterQuiz: "starterQuiz--default",
  cycle1: "cycle--default",
  cycle2: "cycle--default",
  cycle3: "cycle--default",
  exitQuiz: "exitQuiz--default",
  additionalMaterials: "additionalMaterials--default",
};

export function sectionStepToAgentId(
  sectionStep: SectionStep,
  props: {
    config: {
      mathsQuizEnabled: boolean;
    };
    document: {
      subject?: string;
    };
  },
): SectionAgentId {
  const { sectionKey } = sectionStep;

  if (sectionKey === "starterQuiz" || sectionKey === "exitQuiz") {
    const quizAction = sectionStep.quizIntent?.action;

    // Maths lessons share a single mode-aware --maths handler for
    // REGENERATE / ADD / CHANGE. The handler derives QuizBuildMode from
    // sectionStep.quizIntent at the boundary so the composer can pick the
    // right schema and prompt fragments.
    if (props.config.mathsQuizEnabled && props.document.subject === "maths") {
      return `${sectionKey}--maths`;
    }

    if (quizAction === "ADD_QUIZ_QUESTION") {
      return `${sectionKey}--addOne`;
    }
    if (quizAction === "CHANGE_QUIZ_QUESTION") {
      return `${sectionKey}--rewriteOne`;
    }
    return SECTION_AGENT_MAP_DEFAULTS[sectionKey];
  }

  return SECTION_AGENT_MAP_DEFAULTS[sectionKey];
}
