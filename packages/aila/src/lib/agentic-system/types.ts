import type { z } from "zod";

import type {
  AdditionalMaterialsSchema,
  BasedOnSchema,
  CycleSchema,
  KeyLearningPointsSchema,
  KeyStageSchema,
  KeywordsSchema,
  LatestQuizSchema,
  LearningCyclesSchema,
  LearningOutcomeSchema,
  LessonTitleSchema,
  MisconceptionsSchema,
  PartialLessonPlan,
  PriorKnowledgeSchema,
  SubjectSchema,
} from "../../protocol/schema";
import type { MessageToUserAgentOutput } from "./agents/messageToUserAgent/messageToUserAgent.schema";
import type { VoiceId } from "./agents/sectionAgents/shared/voices";
import type { JsonPatchOperation } from "./compatibility/helpers/immerPatchToJsonPatch";
import type {
  PlanStep,
  PlannerOutput,
  SectionKey,
  errorSchema,
} from "./schema";

export type ChatMessage = {
  id: string;
  role:
    | "data" // compatibility
    | "system" // keeping system in to support legacy chats
    | "assistant"
    | "user";
  content: string;
};

// Serializable state that gets persisted
export type AilaPersistedState = {
  messages: ChatMessage[];
  initialDocument: PartialLessonPlan;
  relevantLessons: AgenticRagLessonPlanResult[] | null;
};

type RagSearchArgs = { title: string; subject: string; keyStage: string };
// Runtime context with agents and config
export type AilaRuntimeContext = {
  plannerAgent: (props: PlannerAgentProps) => Promise<WithError<PlannerOutput>>;
  sectionAgents: SectionAgentRegistry;
  messageToUserAgent: (
    props: MessageToUserAgentProps,
  ) => Promise<WithError<MessageToUserAgentOutput>>;
  fetchRelevantLessons: (
    props: RagSearchArgs,
  ) => Promise<AgenticRagLessonPlanResult[]>;
  config: {
    mathsQuizEnabled: boolean;
  };
};

export type AilaTurnCallbacks = {
  onPlannerComplete: ({ sectionKeys }: { sectionKeys: SectionKey[] }) => void;
  onSectionComplete: (patches: JsonPatchOperation[]) => void;
  onTurnComplete: (props: {
    stepsExecuted: PlanStep[];
    document: PartialLessonPlan;
    ailaMessage: string;
  }) => Promise<void>;
};

export type AilaTurnArgs = {
  persistedState: AilaPersistedState;
  runtime: AilaRuntimeContext;
  callbacks: AilaTurnCallbacks;
};

export type AilaTurnResult = {
  persistedState: AilaPersistedState;
  currentTurn: AilaCurrentTurn;
};

export type AilaExecutionContext = {
  persistedState: AilaPersistedState;
  runtime: AilaRuntimeContext;
  currentTurn: AilaCurrentTurn;
  callbacks: AilaTurnCallbacks;
};

export type SectionPromptAgentProps<ResponseType> = {
  responseSchema: z.ZodType<ResponseType>;
  messages: ChatMessage[];
  instructions: string;
  currentValue: ResponseType | undefined;
  exemplarContent: ResponseType[] | undefined;
  basedOnContent: ResponseType | undefined;
  contentToString: (content: ResponseType) => string;
  ctx: AilaExecutionContext;
  extraInputFromCtx?: (
    ctx: AilaExecutionContext,
  ) => { role: "user" | "developer"; content: string }[];
  defaultVoice?: VoiceId;
  voices?: VoiceId[];
};

export type SectionAgent<ResponseType> = {
  id: string;
  description: string;
  handler: (ctx: AilaExecutionContext) => Promise<WithError<ResponseType>>;
};

export type SectionAgentResponseMap = {
  "keyStage--default": z.infer<typeof KeyStageSchema>;
  "subject--default": z.infer<typeof SubjectSchema>;
  "title--default": z.infer<typeof LessonTitleSchema>;
  "basedOn--default": z.infer<typeof BasedOnSchema> | null;
  "learningOutcome--default": z.infer<typeof LearningOutcomeSchema>;
  "learningCycleOutcomes--default": z.infer<typeof LearningCyclesSchema>;
  "priorKnowledge--default": z.infer<typeof PriorKnowledgeSchema>;
  "keyLearningPoints--default": z.infer<typeof KeyLearningPointsSchema>;
  "misconceptions--default": z.infer<typeof MisconceptionsSchema>;
  "keywords--default": z.infer<typeof KeywordsSchema>;
  "starterQuiz--default": z.infer<typeof LatestQuizSchema>;
  "starterQuiz--maths": z.infer<typeof LatestQuizSchema>;
  "cycle--default": z.infer<typeof CycleSchema>;
  "exitQuiz--default": z.infer<typeof LatestQuizSchema>;
  "exitQuiz--maths": z.infer<typeof LatestQuizSchema>;
  "additionalMaterials--default": z.infer<typeof AdditionalMaterialsSchema>;
};

export type SectionAgentRegistry<
  T extends Partial<SectionAgentResponseMap> = SectionAgentResponseMap,
> = {
  [K in keyof T]: SectionAgent<T[K]>;
};

export type PlannerAgentProps = {
  messages: ChatMessage[];
  document: PartialLessonPlan;
  relevantLessons: AgenticRagLessonPlanResult[] | null;
};

export type MessageToUserAgentProps = {
  messages: ChatMessage[];
  prevDoc: PartialLessonPlan;
  nextDoc: PartialLessonPlan;
  stepsExecuted: PlanStep[];
  errors: { message: string }[];
  plannerOutput: PlannerOutput | null;
  relevantLessons: AgenticRagLessonPlanResult[] | null;
  relevantLessonsFetched: boolean;
};

export type AilaState = {
  initialDocument: PartialLessonPlan;
  messages: ChatMessage[];
  plannerAgent: (props: PlannerAgentProps) => Promise<WithError<PlannerOutput>>;
  messageToUserAgent: (
    props: MessageToUserAgentProps,
  ) => Promise<WithError<MessageToUserAgentOutput>>;
  sectionAgents: SectionAgentRegistry;
  relevantLessons: AgenticRagLessonPlanResult[] | null;
  fetchRelevantLessons: (
    ctx: AilaExecutionContext,
  ) => Promise<AgenticRagLessonPlanResult[]>;
};

export type AilaCurrentTurn = {
  document: PartialLessonPlan;
  plannerOutput: PlannerOutput | null;
  errors: { message: string }[];
  stepsExecuted: PlanStep[];
  relevantLessons: AgenticRagLessonPlanResult[] | null;
  relevantLessonsFetched: boolean;
  currentStep: PlanStep | null;
};

export type WithError<T> =
  | { error: null; data: T }
  | { error: z.infer<typeof errorSchema> };

export type AgenticRagLessonPlanResult = {
  ragLessonPlanId: string;
  oakLessonId: number | null;
  oakLessonSlug: string;
  lessonPlan: PartialLessonPlan & { title: string };
};
