import type OpenAI from "openai";
import type { QuizV2 } from "protocol/schema";

import type { SectionAgent, SectionAgentRegistry } from "../../types";
import { additionalMaterialsAgent } from "./additionalMaterialsAgent";
import { basedOnAgent } from "./basedOnAgent";
import { cycleAgent } from "./cycleAgent";
import { exitQuizAgent } from "./exitQuizAgent";
import { keyLearningPointsAgent } from "./keyLearningPointsAgent";
import { keyStageAgent } from "./keyStageAgent";
import { keywordsAgent } from "./keywordsAgent";
import { learningCycleOutcomesAgent } from "./learningCycleOutcomesAgent";
import { learningOutcomeAgent } from "./learningOutcomeAgent";
import { misconceptionsAgent } from "./misconceptionsAgent";
import { priorKnowledgeAgent } from "./priorKnowledgeAgent";
import { starterQuizAgent } from "./starterQuizAgent";
import { subjectAgent } from "./subjectAgent";
import { titleAgent } from "./titleAgent";

export const createSectionAgentRegistry = ({
  openai,
  customAgentHandlers,
}: {
  openai: OpenAI;
  customAgentHandlers: {
    "starterQuiz--maths": SectionAgent<QuizV2>["handler"];
    "exitQuiz--maths": SectionAgent<QuizV2>["handler"];
  };
}): SectionAgentRegistry => ({
  "keyStage--default": keyStageAgent({
    id: "keyStage--default",
    description: "",
    openai,
    contentFromDocument: (document) => document.keyStage,
  }),
  "subject--default": subjectAgent({
    id: "subject--default",
    description: "Generates the subject for the lesson",
    openai,
    contentFromDocument: (document) => document.subject,
  }),
  "title--default": titleAgent({
    id: "title--default",
    description: "Generates the title for the lesson",
    openai,
    contentFromDocument: (document) => document.title,
  }),
  "basedOn--default": basedOnAgent({
    id: "basedOn--default",
    description: "Generates what the lesson is based on",
    openai,
    contentFromDocument: (document) => document.basedOn ?? undefined,
  }),
  "learningOutcome--default": learningOutcomeAgent({
    id: "learningOutcome--default",
    description: "Generates the learning outcome for the lesson",
    openai,
    contentFromDocument: (document) => document.learningOutcome,
  }),
  "learningCycleOutcomes--default": learningCycleOutcomesAgent({
    id: "learningCycleOutcomes--default",
    description: "Generates learning cycle outcomes",
    openai,
    contentFromDocument: (document) => document.learningCycles,
  }),
  "priorKnowledge--default": priorKnowledgeAgent({
    id: "priorKnowledge--default",
    description: "Generates prior knowledge requirements",
    openai,
    contentFromDocument: (document) => document.priorKnowledge,
  }),
  "keyLearningPoints--default": keyLearningPointsAgent({
    id: "keyLearningPoints--default",
    description: "Generates key learning points",
    openai,
    contentFromDocument: (document) => document.keyLearningPoints,
  }),
  "misconceptions--default": misconceptionsAgent({
    id: "misconceptions--default",
    description: "Generates common misconceptions",
    openai,
    contentFromDocument: (document) => document.misconceptions,
  }),
  "keywords--default": keywordsAgent({
    id: "keywords--default",
    description: "Generates keywords for the lesson",
    openai,
    contentFromDocument: (document) => document.keywords,
  }),
  "starterQuiz--default": starterQuizAgent({
    id: "starterQuiz--default",
    description: "Generates starter quiz questions",
    openai,
    contentFromDocument: (document) =>
      "starterQuiz" in document ? document.starterQuiz : undefined,
  }),
  "starterQuiz--maths": {
    id: "starterQuiz--maths",
    description: "Generates starter quiz questions for maths",
    handler: customAgentHandlers["starterQuiz--maths"],
  },
  "cycle--default": cycleAgent({
    id: "cycle--default",
    description: "Generates learning cycle content",
    openai,
    contentFromDocument: (document) => document.cycle1,
  }),
  "exitQuiz--default": exitQuizAgent({
    id: "exitQuiz--default",
    description: "Generates exit quiz questions",
    openai,
    contentFromDocument: (document) =>
      "exitQuiz" in document ? document.exitQuiz : undefined,
  }),
  "exitQuiz--maths": {
    id: "exitQuiz--maths",
    description: "Generates exit quiz questions for maths",
    handler: customAgentHandlers["exitQuiz--maths"],
  },
  "additionalMaterials--default": additionalMaterialsAgent({
    id: "additionalMaterials--default",
    description: "Provides additional materials for the lesson",
    openai,
    contentFromDocument: (document) =>
      document.additionalMaterials ?? undefined,
  }),
});
