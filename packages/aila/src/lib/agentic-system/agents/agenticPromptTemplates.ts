import type { SectionAgentId } from "../schema";
import { britishEnglishCorrectorAgentInstructions } from "./britishEnglishCorrectorAgent/britishEnglishCorrectorAgent.instructions";
import { messageToUserAgentInstructions } from "./messageToUserAgent/messageToUserAgent.instructions";
import { plannerInstructions } from "./plannerAgent/plannerAgent.instructions";
import { additionalMaterialsInstructions } from "./sectionAgents/additionalMaterialsAgent/additionalMaterials.instructions";
import { basedOnInstructions } from "./sectionAgents/basedOnAgent/basedOn.instructions";
import { cyclesInstructions } from "./sectionAgents/cycleAgent/cycle.instructions";
import {
  addOneQuizInstructions as addOneExitQuizInstructions,
  exitQuizInstructions,
  rewriteOneQuizInstructionsTemplate as rewriteOneExitQuizInstructionsTemplate,
} from "./sectionAgents/exitQuizAgent/exitQuiz.instructions";
import { keyLearningPointsInstructions } from "./sectionAgents/keyLearningPointsAgent/keyLearningPoints.instructions";
import { keyStageInstructions } from "./sectionAgents/keyStageAgent/keyStage.instructions";
import { keywordsInstructions } from "./sectionAgents/keywordsAgent/keywords.instructions";
import { learningCycleTitlesInstructions } from "./sectionAgents/learningCycleOutcomesAgent/learningCycleOutcomes.instructions";
import { learningOutcomeInstructions } from "./sectionAgents/learningOutcomeAgent/learningOutcome.instructions";
import { misconceptionsInstructions } from "./sectionAgents/misconceptionsAgent/misconceptions.instructions";
import { priorKnowledgeInstructions } from "./sectionAgents/priorKnowledgeAgent/priorKnowledge.instructions";
import type { StaticPromptTemplate } from "./sectionAgents/shared/staticPromptParts";
import {
  addOneQuizInstructions as addOneStarterQuizInstructions,
  rewriteOneQuizInstructionsTemplate as rewriteOneStarterQuizInstructionsTemplate,
  starterQuizInstructions,
} from "./sectionAgents/starterQuizAgent/starterQuiz.instructions";
import { subjectInstructions } from "./sectionAgents/subjectAgent/subject.instructions";
import { titleInstructions } from "./sectionAgents/titleAgent/title.instructions";

export type AgenticAgentId =
  | "planner"
  | "messageToUser"
  | "britishEnglishCorrector"
  | SectionAgentId;

type UnregisteredQuizAgentId =
  | "starterQuiz--default"
  | "starterQuiz--maths"
  | "exitQuiz--default"
  | "exitQuiz--maths";

export type AgenticPromptTemplateId =
  | Exclude<AgenticAgentId, UnregisteredQuizAgentId>
  | "starterQuiz--default:fullRegen"
  | "starterQuiz--default:addOne"
  | "starterQuiz--default:rewriteOne"
  | "exitQuiz--default:fullRegen"
  | "exitQuiz--default:addOne"
  | "exitQuiz--default:rewriteOne";

/**
 * Single source of truth for each agent's static prompt, for both usage and persistence.
 */
export const AGENTIC_PROMPT_TEMPLATES = {
  planner: {
    includeIdentity: false,
    instructions: plannerInstructions,
    defaultVoice: "AGENT_TO_AGENT",
  },
  messageToUser: {
    includeIdentity: false,
    instructions: messageToUserAgentInstructions,
    defaultVoice: "AILA_TO_TEACHER",
  },
  britishEnglishCorrector: {
    includeIdentity: false,
    instructions: britishEnglishCorrectorAgentInstructions,
  },
  "keyStage--default": {
    includeIdentity: true,
    instructions: keyStageInstructions,
    defaultVoice: "AILA_TO_TEACHER",
  },
  "subject--default": {
    includeIdentity: true,
    instructions: subjectInstructions,
    defaultVoice: "AILA_TO_TEACHER",
  },
  "title--default": {
    includeIdentity: true,
    instructions: titleInstructions,
    defaultVoice: "AILA_TO_TEACHER",
  },
  "basedOn--default": {
    includeIdentity: true,
    instructions: basedOnInstructions,
    defaultVoice: "AILA_TO_TEACHER",
  },
  "learningOutcome--default": {
    includeIdentity: true,
    instructions: learningOutcomeInstructions,
    defaultVoice: "PUPIL",
  },
  "learningCycleOutcomes--default": {
    includeIdentity: true,
    instructions: learningCycleTitlesInstructions,
    defaultVoice: "EXPERT_TEACHER",
  },
  "priorKnowledge--default": {
    includeIdentity: true,
    instructions: priorKnowledgeInstructions,
    defaultVoice: "EXPERT_TEACHER",
  },
  "keyLearningPoints--default": {
    includeIdentity: true,
    instructions: keyLearningPointsInstructions,
    defaultVoice: "EXPERT_TEACHER",
  },
  "misconceptions--default": {
    includeIdentity: true,
    instructions: misconceptionsInstructions,
    defaultVoice: "EXPERT_TEACHER",
  },
  "keywords--default": {
    includeIdentity: true,
    instructions: keywordsInstructions,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "starterQuiz--default:fullRegen": {
    includeIdentity: true,
    instructions: starterQuizInstructions,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "starterQuiz--default:addOne": {
    includeIdentity: true,
    instructions: addOneStarterQuizInstructions,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "starterQuiz--default:rewriteOne": {
    includeIdentity: true,
    instructions: rewriteOneStarterQuizInstructionsTemplate,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "cycle--default": {
    includeIdentity: true,
    instructions: cyclesInstructions,
    defaultVoice: "EXPERT_TEACHER",
  },
  "exitQuiz--default:fullRegen": {
    includeIdentity: true,
    instructions: exitQuizInstructions,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "exitQuiz--default:addOne": {
    includeIdentity: true,
    instructions: addOneExitQuizInstructions,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "exitQuiz--default:rewriteOne": {
    includeIdentity: true,
    instructions: rewriteOneExitQuizInstructionsTemplate,
    defaultVoice: "TEACHER_TO_PUPIL_WRITTEN",
  },
  "additionalMaterials--default": {
    includeIdentity: true,
    instructions: additionalMaterialsInstructions,
    voices: ["EXPERT_TEACHER"],
    defaultVoice: "EXPERT_TEACHER",
  },
} satisfies Partial<Record<AgenticPromptTemplateId, StaticPromptTemplate>>;

export function getAgenticPromptTemplate(
  promptTemplateId: string,
): StaticPromptTemplate | undefined {
  return (AGENTIC_PROMPT_TEMPLATES as Record<string, StaticPromptTemplate>)[
    promptTemplateId
  ];
}
