import type { LooseLessonPlan } from "../../protocol/schema";
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
  "title",
  "subject",
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
  "messageToUser",
  "deleteSection",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
type PlanStep<K extends AgentId = AgentId> = K extends keyof AgentRegistry
  ? AgentRegistry[K] extends AgentDefinition<AilaState, infer _TId, infer TArgs>
    ? TArgs extends void
      ? { agentId: K; args?: never }
      : { agentId: K; args: TArgs }
    : never
  : never;

export type AilaState = {
  doc: LooseLessonPlan;
  context: string[];
  messages: ChatMessage[];
  planner: AgentDefinition<AilaState>;
  plan: PlanStep[];
  agents: AgentRegistry;
  error: string | null;
};
