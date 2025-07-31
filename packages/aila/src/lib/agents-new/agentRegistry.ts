type Agent<InputSlice, OutputSlice> = (
  slice: InputSlice,
) => Promise<OutputSlice & { error?: string }>;

// Selector function for picking required state
type Selector<FullState, Slice> = (state: FullState) => Slice;

export type AgentDefinition<FullState, InputSlice, OutputSlice> = {
  /** Unique identifier for the agent */
  id: string;

  /** Human-readable description of the agent's purpose */
  description?: string;

  /** Selects the slice of state required by the agent */
  selector: Selector<FullState, InputSlice>;

  /** The core logic handler of the agent */
  handler: Agent<InputSlice, OutputSlice>;
};

export type AgentRegistry<FullState> = AgentDefinition<FullState, any, any>[];
