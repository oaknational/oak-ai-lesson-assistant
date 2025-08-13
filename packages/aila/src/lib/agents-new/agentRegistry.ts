import { z } from "zod";

import type { LooseLessonPlan } from "../../protocol/schema";
import type { RagLessonPlan } from "../../utils/rag/fetchRagContent";
import type { SectionKey } from "./promptAgents";

export type AgentDefinition<
  TState,
  TId extends string = string,
  TArgs = void,
> = {
  id: TId;
  description: string;
  handler: TArgs extends void
    ? (state: TState) => Promise<TState>
    : (state: TState, args: TArgs) => Promise<TState>;
};

export type AgentRegistry = {
  [K in Exclude<AgentId, "deleteSection">]: AgentDefinition<AilaState, K>;
} & {
  deleteSection: AgentDefinition<
    AilaState,
    "deleteSection",
    { sectionKey: SectionKey }
  >;
};

export const AGENT_IDS = [
  "keyStage",
  "subject",
  "title",
  "basedOn",
  "learningOutcome",
  "learningCycles",
  "priorKnowledge",
  "keyLearningPoints",
  "misconceptions",
  "keywords",
  "starterQuiz",
  "cycle1",
  "cycle2",
  "cycle3",
  "exitQuiz",
  "additionalMaterials",
  "deleteSection",
  "fetchRelevantLessons",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

type ChatMessage =
  | {
      role: "user";
      content: string;
    }
  | {
      role: "assistant";
      content: string;
      stepsExecuted: PlanStep[];
    };
type PlanStep<K extends AgentId = AgentId> = K extends keyof AgentRegistry
  ? AgentRegistry[K] extends AgentDefinition<AilaState, infer _TId, infer TArgs>
    ? TArgs extends void
      ? { agentId: K; args?: never }
      : { agentId: K; args: TArgs }
    : never
  : never;

export const refusalSchema = z.object({
  reason: z
    .enum(["out_of_scope", "ethical_concern"])
    .describe("Reason for refusal"),
});

export const directResponseSchema = z.object({
  type: z
    .enum(["answer", "clarification_request", "capability_explanation"])
    .describe("Type of direct response"),
  content: z.string().describe("The response content to send to the user"),
});

export const errorSchema = z.object({
  message: z.string().describe("Error message"),
});

export type AilaState = {
  docAtStartOfTurn: LooseLessonPlan;
  doc: LooseLessonPlan;
  messages: ChatMessage[];
  messageToUser: AgentDefinition<AilaState, "messageToUser">;
  planner: AgentDefinition<AilaState, "router">;
  plan: PlanStep[];
  agents: AgentRegistry;
  error: z.infer<typeof errorSchema> | null;
  refusal: z.infer<typeof refusalSchema> | null;
  contextNotes: string | null;
  relevantLessons: RagLessonPlan[] | null;
  currentTurn: {
    stepsExecuted: PlanStep[];
    directResponse: z.infer<typeof directResponseSchema> | null;
  };
};
