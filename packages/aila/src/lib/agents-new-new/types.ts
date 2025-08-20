import type { z } from "zod";

import type {
  AdditionalMaterialsSchema,
  BasedOnSchema,
  CycleSchema,
  KeyLearningPointsSchema,
  KeyStageSchema,
  KeywordsSchema,
  LearningCyclesSchema,
  LearningOutcomeSchema,
  LessonTitleSchema,
  LooseLessonPlan,
  MisconceptionsSchema,
  PriorKnowledgeSchema,
  QuizV2Schema,
  SubjectSchema,
} from "../../protocol/schema";
import type { RagLessonPlan } from "../../utils/rag/fetchRagContent";
import type { PresentationAgentOutput } from "./presentationAgent/presentationAgent.schema";
import type { PlanStep, PlannerOutput, errorSchema } from "./schema";

export type ChatMessage = { role: "assistant" | "user"; content: string };

export type SectionPromptAgentProps<ResponseType> = {
  responseSchema: z.ZodType<ResponseType>;
  messages: ChatMessage[];
  instructions: string;
  currentValue: ResponseType | undefined;
  exemplarContent: ResponseType[] | undefined;
  basedOnContent: ResponseType | undefined;
  contentToString: (content: ResponseType) => string;
  state: AilaState;
  extraInputFromState?: (
    state: AilaState,
  ) => { role: "user" | "developer"; content: string }[];
};

export type SectionAgentHandlerProps = {
  state: AilaState;
  currentTurn: AilaCurrentTurn;
};
export type SectionAgent<ResponseType> = {
  id: string;
  description: string;
  handler: (
    props: SectionAgentHandlerProps,
  ) => Promise<WithError<ResponseType>>;
};

export type SectionAgentResponseMap = {
  "keyStage--default": z.infer<typeof KeyStageSchema>;
  "subject--default": z.infer<typeof SubjectSchema>;
  "title--default": z.infer<typeof LessonTitleSchema>;
  "basedOn--default": z.infer<typeof BasedOnSchema>;
  "learningOutcome--default": z.infer<typeof LearningOutcomeSchema>;
  "learningCycleOutcomes--default": z.infer<typeof LearningCyclesSchema>;
  "priorKnowledge--default": z.infer<typeof PriorKnowledgeSchema>;
  "keyLearningPoints--default": z.infer<typeof KeyLearningPointsSchema>;
  "misconceptions--default": z.infer<typeof MisconceptionsSchema>;
  "keywords--default": z.infer<typeof KeywordsSchema>;
  "starterQuiz--default": z.infer<typeof QuizV2Schema>;
  "starterQuiz--maths": z.infer<typeof QuizV2Schema>;
  "cycle--default": z.infer<typeof CycleSchema>;
  "exitQuiz--default": z.infer<typeof QuizV2Schema>;
  "exitQuiz--maths": z.infer<typeof QuizV2Schema>;
  "additionalMaterials--default": z.infer<typeof AdditionalMaterialsSchema>;
};

export type SectionAgentRegistry<
  T extends Partial<SectionAgentResponseMap> = SectionAgentResponseMap,
> = {
  [K in keyof T]: SectionAgent<T[K]>;
};

export type PlannerAgentProps = {
  messages: ChatMessage[];
  document: LooseLessonPlan;
  relevantLessons: RagLessonPlan[] | null;
};

export type PresentationAgentProps = {
  messages: ChatMessage[];
  prevDoc: LooseLessonPlan;
  nextDoc: LooseLessonPlan;
  stepsExecuted: PlanStep[];
  errors: { message: string }[];
  plannerOutput: PlannerOutput | null;
  relevantLessons: RagLessonPlan[] | null;
  relevantLessonsFetched: boolean;
};

export type AilaState = {
  initialDocument: LooseLessonPlan;
  messages: ChatMessage[];
  plannerAgent: (props: PlannerAgentProps) => Promise<WithError<PlannerOutput>>;
  presentationAgent: (
    props: PresentationAgentProps,
  ) => Promise<WithError<PresentationAgentOutput>>;
  sectionAgents: SectionAgentRegistry;
  relevantLessons: RagLessonPlan[] | null;
  fetchRelevantLessons: () => Promise<RagLessonPlan[]>;
};

export type AilaCurrentTurn = {
  document: LooseLessonPlan;
  plannerOutput: PlannerOutput | null;
  errors: { message: string }[];
  stepsExecuted: PlanStep[];
  relevantLessonsFetched: boolean;
};

export type WithError<T> =
  | { error: null; data: T }
  | { error: z.infer<typeof errorSchema> };
