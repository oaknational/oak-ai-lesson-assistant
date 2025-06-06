import { z } from "zod";

import {
  type CompletedLessonPlan,
  CycleSchemaWithoutLength,
  KeyLearningPointsSchema,
  KeyStageSchema,
  KeywordsSchemaWithoutLength,
  LearningCyclesSchema,
  LearningOutcomeSchema,
  type LessonPlanKey,
  LessonTitleSchema,
  type LooseLessonPlan,
  MisconceptionsSchemaWithoutLength,
  PriorKnowledgeSchema,
  QuizSchemaWithoutLength,
  SubjectSchema,
  TopicSchema,
} from "../../protocol/schema";
import { exitQuizInstructions } from "./prompts/exitQuizInstructions";
import { keyLearningPointsInstructions } from "./prompts/keyLearningPointsInstructions";
import { keywordsInstructions } from "./prompts/keywordsInstructions";
import { learningCycleTitlesInstructions } from "./prompts/learningCycleTitlesInstructions";
import { learningCyclesInstructions } from "./prompts/learningCyclesInstructions";
import { learningOutcomeInstructions } from "./prompts/learningOutcomeInstructions";
import { misconceptionsInstructions } from "./prompts/misconceptionsInstructions";
import { priorKnowledgeInstructions } from "./prompts/priorKnowledgeInstructions";
import { quizInstructions } from "./prompts/quizInstructions";
import { starterQuizInstructions } from "./prompts/starterQuizInstructions";

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
]);

export type AgentName = z.infer<typeof agentNames>;

const _unknownAgentResponseSchema = z.object({
  value: z.unknown(),
});
export type AgentResponse = z.infer<typeof _unknownAgentResponseSchema>;

const _agentResponseAnySchema = z
  .object({
    value: z.any(),
  })
  .required();

type AgentResponseAny = z.infer<typeof _agentResponseAnySchema>;
export type SchemaWithValue = z.ZodObject<{ value: z.ZodTypeAny }>;

export type PromptAgentDefinition<
  Schema extends SchemaWithValue = typeof _agentResponseAnySchema,
> = {
  type: "prompt";
  name: AgentName;
  prompt: string;
  schema: Schema;
  extractRagData: (exampleLessonPlan: CompletedLessonPlan) => string;
};
export type AgentDefinition =
  | PromptAgentDefinition<SchemaWithValue>
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
    schema: z.object({ value: LessonTitleSchema }),
    extractRagData: (lp) => lp.title,
  },
  keyStage: {
    type: "prompt",
    name: "keyStage",
    prompt: "Specify the Key Stage for this lesson.",
    schema: z.object({ value: KeyStageSchema }),
    extractRagData: (lp) => lp.keyStage,
  },
  subject: {
    type: "prompt",
    name: "subject",
    prompt: "Specify the subject for this lesson.",
    schema: z.object({ value: SubjectSchema }),
    extractRagData: (lp) => lp.subject,
  },
  topic: {
    type: "prompt",
    name: "topic",
    prompt: "Specify the topic for this lesson.",
    schema: z.object({ value: TopicSchema }),
    extractRagData: (lp) => lp.topic,
  },
  learningOutcome: {
    type: "prompt",
    name: "learningOutcome",
    prompt: learningOutcomeInstructions,
    schema: z.object({ value: LearningOutcomeSchema }),
    extractRagData: (lp) => lp.learningOutcome,
  },
  learningCycles: {
    type: "prompt",
    name: "learningCycles",
    prompt: learningCycleTitlesInstructions,
    schema: z.object({ value: LearningCyclesSchema }),
    extractRagData: (lp) => JSON.stringify(lp.learningCycles),
  },
  priorKnowledge: {
    type: "prompt",
    name: "priorKnowledge",
    prompt: priorKnowledgeInstructions,
    schema: z.object({ value: PriorKnowledgeSchema }),
    extractRagData: (lp) => JSON.stringify(lp.priorKnowledge),
  },
  keyLearningPoints: {
    type: "prompt",
    name: "keyLearningPoints",
    prompt: keyLearningPointsInstructions,
    schema: z.object({ value: KeyLearningPointsSchema }),
    extractRagData: (lp) => JSON.stringify(lp.keyLearningPoints),
  },
  misconceptions: {
    type: "prompt",
    name: "misconceptions",
    prompt: misconceptionsInstructions,
    schema: z.object({ value: MisconceptionsSchemaWithoutLength }),
    extractRagData: (lp) => JSON.stringify(lp.misconceptions),
  },
  keywords: {
    type: "prompt",
    name: "keywords",
    prompt: keywordsInstructions,
    schema: z.object({ value: KeywordsSchemaWithoutLength }),
    extractRagData: (lp) => JSON.stringify(lp.keywords),
  },
  starterQuiz: {
    type: "prompt",
    name: "starterQuiz",
    prompt: [starterQuizInstructions, quizInstructions].join(`\n\n`),
    schema: z.object({ value: QuizSchemaWithoutLength }),
    extractRagData: (lp) => JSON.stringify(lp.starterQuiz),
  },
  cycle: {
    type: "prompt",
    name: "cycle",
    prompt: learningCyclesInstructions,
    schema: z.object({ value: CycleSchemaWithoutLength }),
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
    prompt: [exitQuizInstructions, quizInstructions].join(`\n\n`),
    schema: z.object({ value: QuizSchemaWithoutLength }),
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
};

export const sectionAgentMap: Record<
  Exclude<
    LessonPlanKey,
    "title" | "subject" | "keyStage" | "topic" | "additionalMaterials"
  >,
  (ctx: { lessonPlan: LooseLessonPlan }) => AgentName
> = {
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
  // additionalMaterials: ["additionalMaterials"],
};
