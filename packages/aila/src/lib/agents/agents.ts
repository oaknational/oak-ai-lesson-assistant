import { z } from "zod";

import {
  CycleSchemaWithoutLength,
  KeyLearningPointsSchema,
  KeyStageSchema,
  KeywordsSchemaWithoutLength,
  LearningCyclesSchema,
  LearningOutcomeSchema,
  type LessonPlanKey,
  LessonTitleSchema,
<<<<<<< HEAD
  type LooseLessonPlan,
=======
>>>>>>> main
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
<<<<<<< HEAD
  "mathsStarterQuiz",
  "mathsExitQuiz",
=======
  "mathsQuiz",
>>>>>>> main
  "deleteSection",
  "endTurn",
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
  whenToUse?: string[];
};
export type AgentDefinition<Schema extends AgentResponse = AgentResponseAny> =
  | PromptAgentDefinition<SchemaWithValue>
  | {
      type: "custom";
      name: AgentName;
      schema?: z.ZodTypeAny;
      whenToUse?: string[];
<<<<<<< HEAD
    }
  | {
      type: "asyncFunction";
      name: AgentName;
      whenToUse?: string[];
      // fn: <T>(args: T) => Promise<JsonPatchDocumentOptional>;
=======
>>>>>>> main
    };

export const agents: Record<AgentName, AgentDefinition> = {
  title: {
    type: "prompt",
    name: "title",
    prompt: "Generate a title for the lesson plan.",
    schema: z.object({ value: LessonTitleSchema }),
  },
  keyStage: {
    type: "prompt",
    name: "keyStage",
    prompt: "Specify the Key Stage for this lesson.",
    schema: z.object({ value: KeyStageSchema }),
  },
  subject: {
    type: "prompt",
    name: "subject",
    prompt: "Specify the subject for this lesson.",
    schema: z.object({ value: SubjectSchema }),
  },
  topic: {
    type: "prompt",
    name: "topic",
    prompt: "Specify the topic for this lesson.",
    schema: z.object({ value: TopicSchema }),
  },
  learningOutcome: {
    type: "prompt",
    name: "learningOutcome",
    prompt: learningOutcomeInstructions,
    schema: z.object({ value: LearningOutcomeSchema }),
  },
  learningCycles: {
    type: "prompt",
    name: "learningCycles",
    prompt: learningCycleTitlesInstructions,
    schema: z.object({ value: LearningCyclesSchema }),
  },
  priorKnowledge: {
    type: "prompt",
    name: "priorKnowledge",
    prompt: priorKnowledgeInstructions,
    schema: z.object({ value: PriorKnowledgeSchema }),
  },
  keyLearningPoints: {
    type: "prompt",
    name: "keyLearningPoints",
    prompt: keyLearningPointsInstructions,
    schema: z.object({ value: KeyLearningPointsSchema }),
  },
  misconceptions: {
    type: "prompt",
    name: "misconceptions",
    prompt: misconceptionsInstructions,
    schema: z.object({ value: MisconceptionsSchemaWithoutLength }),
  },
  keywords: {
    type: "prompt",
    name: "keywords",
    prompt: keywordsInstructions,
    schema: z.object({ value: KeywordsSchemaWithoutLength }),
  },
  starterQuiz: {
    type: "prompt",
    name: "starterQuiz",
    prompt: [starterQuizInstructions, quizInstructions].join(`\n\n`),
    schema: z.object({ value: QuizSchemaWithoutLength }),
  },
  cycle: {
    type: "prompt",
    name: "cycle",
    prompt: learningCyclesInstructions,
    schema: z.object({ value: CycleSchemaWithoutLength }),
  },
  exitQuiz: {
    type: "prompt",
    name: "exitQuiz",
    prompt: [exitQuizInstructions, quizInstructions].join(`\n\n`),
    schema: z.object({ value: QuizSchemaWithoutLength }),
  },
<<<<<<< HEAD
  mathsStarterQuiz: {
    type: "asyncFunction",
    name: "mathsStarterQuiz",
  },
  mathsExitQuiz: {
    type: "asyncFunction",
    name: "mathsExitQuiz",
=======
  mathsQuiz: {
    type: "custom",
    name: "mathsQuiz",
    whenToUse: [
      "do not use this agent if the subject is not maths/math/mathematics",
      "only suggest this agent if the next appropriate task is the generation of a starter or exit quiz",
      "if you select this agent, a quiz will be generated, and no other parts of the lesson will be affected",
    ],
>>>>>>> main
  },
  deleteSection: {
    type: "custom",
    name: "deleteSection",
  },
  endTurn: {
    type: "custom",
    name: "endTurn",
  },
};

export const sectionAgentMap: Record<
  Exclude<
    LessonPlanKey,
    | "title"
    | "subject"
    | "keyStage"
    | "topic"
    | "basedOn"
    | "additionalMaterials"
  >,
<<<<<<< HEAD
  (ctx: { lessonPlan: LooseLessonPlan }) => AgentName
> = {
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
=======
  AgentName
> = {
  learningOutcome: "learningOutcome",
  learningCycles: "learningCycles",
  priorKnowledge: "priorKnowledge",
  keyLearningPoints: "keyLearningPoints",
  misconceptions: "misconceptions",
  keywords: "keywords",
  starterQuiz: "starterQuiz",
  cycle1: "cycle",
  cycle2: "cycle",
  cycle3: "cycle",
  exitQuiz: "exitQuiz",
>>>>>>> main
  // additionalMaterials: ["additionalMaterials"],
};
