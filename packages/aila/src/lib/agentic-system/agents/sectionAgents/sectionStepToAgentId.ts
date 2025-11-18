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
  if (props.config.mathsQuizEnabled && props.document.subject === "maths") {
    if (sectionStep.sectionKey === "starterQuiz") {
      return "starterQuiz--maths";
    }
    if (sectionStep.sectionKey === "exitQuiz") {
      return "exitQuiz--maths";
    }
  }

  return SECTION_AGENT_MAP_DEFAULTS[sectionStep.sectionKey];
}
