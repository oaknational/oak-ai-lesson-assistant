import { z } from "zod";

import {
  AdditionalMaterialsSchema,
  type CompletedLessonPlan,
  CycleSchema,
  CycleSchemaWithoutLength,
  KeyLearningPointsSchema,
  KeyLearningPointsStrictMax5Schema,
  KeyStageSchema,
  KeywordsSchema,
  KeywordsSchemaWithoutLength,
  LearningCyclesSchema,
  LearningCyclesStrictMax3Schema,
  LearningOutcomeSchema,
  LearningOutcomeSchemaStrictMax190,
  type LessonPlanKey,
  LessonTitleSchema,
  type LooseLessonPlan,
  MisconceptionsSchema,
  MisconceptionsSchemaWithoutLength,
  PriorKnowledgeSchema,
  PriorKnowledgeStrictMax5Schema,
  QuizV2MultipleChoiceOnlySchemaWithoutLength,
  QuizV2MultipleChoiceOnlyStrictMax6Schema,
  SubjectSchema,
  TopicSchema,
} from "../../protocol/schema";
import { additionalMaterialsInstructions } from "./prompts/additionalMaterialsInstructions";
import { exitQuizInstructions } from "./prompts/exitQuizInstructions";
import { keyLearningPointsInstructions } from "./prompts/keyLearningPointsInstructions";
import { keywordsInstructions } from "./prompts/keywordsInstructions";
import { learningCycleTitlesInstructions } from "./prompts/learningCycleTitlesInstructions";
import { learningCyclesInstructions } from "./prompts/learningCyclesInstructions";
import { learningOutcomeInstructions } from "./prompts/learningOutcomeInstructions";
import { misconceptionsInstructions } from "./prompts/misconceptionsInstructions";
import { priorKnowledgeInstructions } from "./prompts/priorKnowledgeInstructions";
import { identity } from "./prompts/shared/identity";
import { quizQuestionDesignInstructions } from "./prompts/shared/quizQuestionDesignInstructions";
import { tier2And3VocabularyDefinitions } from "./prompts/shared/tier2And3VocabularyDefinitions";
import { starterQuizInstructions } from "./prompts/starterQuizInstructions";
import { subjectInstructions } from "./prompts/subjectInstructions";

export const agentNames = z.enum([
  "title",
  "keyStage",
  "subject",
  "topic",
  "learningOutcome",
  "learningCycles",
  "priorKnowledge",
  "keyLearningPoints",
  "misconceptions",
  "keywords",
  "starterQuiz",
  "cycle",
  "exitQuiz",
  "mathsStarterQuiz",
  "mathsExitQuiz",
  "deleteSection",
  "endTurn",
  "basedOn",
  "additionalMaterials",
]);

export type AgentName = z.infer<typeof agentNames>;

export type SchemaWithValue = z.ZodObject<{ value: z.ZodTypeAny }>;

export type PromptAgentDefinition<
  SchemaForLLM extends z.ZodSchema = z.ZodSchema,
  SchemaStrict extends z.ZodSchema = z.ZodSchema,
> = {
  type: "prompt";
  name: AgentName;
  prompt: string;
  schemaForLLM: SchemaForLLM;
  schemaStrict: SchemaStrict;
  extractRagData: (exampleLessonPlan: CompletedLessonPlan) => string | null;
};
export type AgentDefinition =
  | PromptAgentDefinition
  | {
      type: "custom";
      name: AgentName;
      schema?: z.ZodTypeAny;
      extractRagData?: (exampleLessonPlan: CompletedLessonPlan) => string;
    }
  | {
      type: "asyncFunction";
      name: AgentName;
      extractRagData?: (exampleLessonPlan: CompletedLessonPlan) => string;
    };

export const agents: Record<AgentName, AgentDefinition> = {
  title: {
    type: "prompt",
    name: "title",
    prompt: "Generate a title for the lesson plan.",
    schemaForLLM: LessonTitleSchema,
    schemaStrict: LessonTitleSchema,
    extractRagData: (lp) => lp.title,
  },
  keyStage: {
    type: "prompt",
    name: "keyStage",
    prompt: "Specify the Key Stage for this lesson.",
    schemaForLLM: KeyStageSchema,
    schemaStrict: KeyStageSchema,
    extractRagData: (lp) => lp.keyStage,
  },
  subject: {
    type: "prompt",
    name: "subject",
    prompt: subjectInstructions(),
    schemaForLLM: SubjectSchema,
    schemaStrict: SubjectSchema,
    extractRagData: (lp) => lp.subject,
  },
  topic: {
    type: "prompt",
    name: "topic",
    prompt: "Specify the topic for this lesson.",
    schemaForLLM: TopicSchema,
    schemaStrict: TopicSchema,
    extractRagData: (lp) => lp.topic,
  },
  learningOutcome: {
    type: "prompt",
    name: "learningOutcome",
    prompt: learningOutcomeInstructions({ identity }),
    schemaForLLM: LearningOutcomeSchema,
    schemaStrict: LearningOutcomeSchemaStrictMax190,
    extractRagData: (lp) => lp.learningOutcome,
  },
  learningCycles: {
    type: "prompt",
    name: "learningCycles",
    prompt: learningCycleTitlesInstructions({ identity }),
    schemaForLLM: LearningCyclesSchema,
    schemaStrict: LearningCyclesStrictMax3Schema,
    extractRagData: (lp) => JSON.stringify(lp.learningCycles),
  },
  priorKnowledge: {
    type: "prompt",
    name: "priorKnowledge",
    prompt: priorKnowledgeInstructions({ identity }),
    schemaForLLM: PriorKnowledgeSchema,
    schemaStrict: PriorKnowledgeStrictMax5Schema,
    extractRagData: (lp) => JSON.stringify(lp.priorKnowledge),
  },
  keyLearningPoints: {
    type: "prompt",
    name: "keyLearningPoints",
    prompt: keyLearningPointsInstructions({ identity }),
    schemaForLLM: KeyLearningPointsSchema,
    schemaStrict: KeyLearningPointsStrictMax5Schema,
    extractRagData: (lp) => JSON.stringify(lp.keyLearningPoints),
  },
  misconceptions: {
    type: "prompt",
    name: "misconceptions",
    prompt: misconceptionsInstructions({ identity }),
    schemaForLLM: MisconceptionsSchemaWithoutLength,
    schemaStrict: MisconceptionsSchema,
    extractRagData: (lp) => JSON.stringify(lp.misconceptions),
  },
  keywords: {
    type: "prompt",
    name: "keywords",
    prompt: keywordsInstructions({ identity, tier2And3VocabularyDefinitions }),
    schemaForLLM: KeywordsSchemaWithoutLength,
    schemaStrict: KeywordsSchema,
    extractRagData: (lp) => JSON.stringify(lp.keywords),
  },
  starterQuiz: {
    type: "prompt",
    name: "starterQuiz",
    prompt: starterQuizInstructions({
      identity,
      quizQuestionDesignInstructions,
    }),
    schemaForLLM: QuizV2MultipleChoiceOnlySchemaWithoutLength,
    schemaStrict: QuizV2MultipleChoiceOnlyStrictMax6Schema,
    extractRagData: (lp) => JSON.stringify(lp.starterQuiz),
  },
  cycle: {
    type: "prompt",
    name: "cycle",
    prompt: learningCyclesInstructions({
      identity,
      quizQuestionDesignInstructions,
    }),
    schemaForLLM: CycleSchemaWithoutLength,
    schemaStrict: CycleSchema,
    extractRagData: (lp) => {
      // @todo we probably only need one cycle (the relevant one)
      return JSON.stringify({
        cycle1: lp.cycle1,
        cycle2: lp.cycle2,
        cycle3: lp.cycle3,
      });
    },
  },
  exitQuiz: {
    type: "prompt",
    name: "exitQuiz",
    prompt: exitQuizInstructions({ identity, quizQuestionDesignInstructions }),
    schemaForLLM: QuizV2MultipleChoiceOnlySchemaWithoutLength,
    schemaStrict: QuizV2MultipleChoiceOnlyStrictMax6Schema,
    extractRagData: (lp) => JSON.stringify(lp.exitQuiz),
  },
  mathsStarterQuiz: {
    type: "asyncFunction",
    name: "mathsStarterQuiz",
  },
  mathsExitQuiz: {
    type: "asyncFunction",
    name: "mathsExitQuiz",
  },
  deleteSection: {
    type: "custom",
    name: "deleteSection",
  },
  endTurn: {
    type: "custom",
    name: "endTurn",
  },
  basedOn: {
    type: "asyncFunction",
    name: "basedOn",
  },
  additionalMaterials: {
    type: "prompt",
    name: "additionalMaterials",
    prompt: additionalMaterialsInstructions({
      identity,
      tier2And3VocabularyDefinitions,
    }),
    schemaForLLM: AdditionalMaterialsSchema,
    schemaStrict: AdditionalMaterialsSchema,
    extractRagData: (lp) => JSON.stringify(lp.additionalMaterials),
  },
};

export const sectionAgentMap: Record<
  LessonPlanKey,
  (ctx: { lessonPlan: LooseLessonPlan }) => AgentName
> = {
  title: () => "title",
  keyStage: () => "keyStage",
  subject: () => "subject",
  topic: () => "topic",
  basedOn: () => "basedOn",
  learningOutcome: () => "learningOutcome",
  learningCycles: () => "learningCycles",
  priorKnowledge: () => "priorKnowledge",
  keyLearningPoints: () => "keyLearningPoints",
  misconceptions: () => "misconceptions",
  keywords: () => "keywords",
  starterQuiz: (ctx) => {
    if (ctx.lessonPlan.subject === "maths") {
      return "mathsStarterQuiz";
    }
    return "starterQuiz";
  },
  cycle1: () => "cycle",
  cycle2: () => "cycle",
  cycle3: () => "cycle",
  exitQuiz: (ctx) => {
    if (ctx.lessonPlan.subject === "maths") {
      return "mathsExitQuiz";
    }
    return "exitQuiz";
  },
  additionalMaterials: () => "additionalMaterials",
};
