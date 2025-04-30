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
  MisconceptionsSchemaWithoutLength,
  PriorKnowledgeSchema,
  QuizSchemaWithoutLength,
  SubjectSchema,
  TopicSchema,
} from "../../protocol/schema";

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
  "mathsQuiz",
  "deleteSection",
  "endTurn",
]);

export type AgentName = z.infer<typeof agentNames>;

export type PromptAgentDefinition<Schema extends z.ZodType = z.ZodTypeAny> = {
  type: "prompt";
  name: AgentName;
  prompt: string;
  schema: Schema;
  whenToUse?: string[];
};
export type AgentDefinition<Schema extends z.ZodType = z.ZodTypeAny> =
  | PromptAgentDefinition<Schema>
  | {
      type: "custom";
      name: AgentName;
      schema?: z.ZodTypeAny;
      whenToUse?: string[];
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
    prompt: "Generate the learning outcome for this lesson.",
    schema: z.object({ value: LearningOutcomeSchema }),
  },
  learningCycles: {
    type: "prompt",
    name: "learningCycles",
    prompt: "Generate the learning cycles for this lesson.",
    schema: z.object({ value: LearningCyclesSchema }),
  },
  priorKnowledge: {
    type: "prompt",
    name: "priorKnowledge",
    prompt: "List the prior knowledge required for this lesson.",
    schema: z.object({ value: PriorKnowledgeSchema }),
  },
  keyLearningPoints: {
    type: "prompt",
    name: "keyLearningPoints",
    prompt: "List the key learning points for this lesson.",
    schema: z.object({ value: KeyLearningPointsSchema }),
  },
  misconceptions: {
    type: "prompt",
    name: "misconceptions",
    prompt: "List common misconceptions and corrections.",
    schema: z.object({ value: MisconceptionsSchemaWithoutLength }),
  },
  keywords: {
    type: "prompt",
    name: "keywords",
    prompt: "List keywords and their definitions.",
    schema: z.object({ value: KeywordsSchemaWithoutLength }),
  },
  starterQuiz: {
    type: "prompt",
    name: "starterQuiz",
    prompt: "Generate a starter quiz for this lesson.",
    schema: z.object({ value: QuizSchemaWithoutLength }),
  },
  cycle: {
    type: "prompt",
    name: "cycle",
    prompt: "Generate a cycle.",
    schema: z.object({ value: CycleSchemaWithoutLength }),
  },
  exitQuiz: {
    type: "prompt",
    name: "exitQuiz",
    prompt: "Generate an exit quiz for this lesson.",
    schema: z.object({ value: QuizSchemaWithoutLength }),
  },
  mathsQuiz: {
    type: "custom",
    name: "mathsQuiz",
    whenToUse: [
      "do not use this agent if the subject is not maths/math/mathematics",
      "only suggest this agent if the next appropriate task is the generation of a starter or exit quiz",
      "if you select this agent, a quiz will be generated, and no other parts of the lesson will be affected",
    ],
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
  // additionalMaterials: ["additionalMaterials"],
};
