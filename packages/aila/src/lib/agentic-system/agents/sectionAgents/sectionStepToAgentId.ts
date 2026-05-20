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
  console.log("Determining agent for sectionKey:", sectionKey);
  console.log("Props:", props.config.mathsQuizEnabled, props.document.subject);

  if (
    (sectionKey === "starterQuiz" || sectionKey === "exitQuiz") &&
    props.config.mathsQuizEnabled &&
    props.document.subject === "maths"
  ) {
    console.log(
      `Using maths-specific agent for section ${sectionKey} because mathsQuizEnabled is true and subject is maths`,
    );
    return `${sectionKey}--maths`;
  }

  return SECTION_AGENT_MAP_DEFAULTS[sectionKey];
}
