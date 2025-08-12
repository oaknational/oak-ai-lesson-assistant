import type { LooseLessonPlan } from "../../protocol/schema";
import type { AgentDefinition } from "./agentRegistry";
import { type AilaState, ailaTurn } from "./ailaTurn";

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("ailaTurn", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  const createMockState = (overrides?: Partial<AilaState>): AilaState => {
    const mockDoc: LooseLessonPlan = {
      title: "Test Lesson",
      subject: "Mathematics",
      keyStage: "key-stage-2",
      topic: "Addition",
    };

    const mockPlanner: AgentDefinition<AilaState> = {
      id: "planner",
      description: "Plans the turn",
      handler: jest.fn().mockResolvedValue({
        plan: [{ agentId: "testAgent", action: "add" as const }],
      }),
    };

    const mockMessageAgent: AgentDefinition<AilaState> = {
      id: "messageToUser",
      description: "Sends messages to user",
      handler: jest.fn().mockResolvedValue({
        messages: [
          ...(overrides?.messages ?? []),
          { role: "assistant" as const, content: "Test response" },
        ],
      }),
    };

    return {
      doc: mockDoc,
      context: ["test context"],
      messages: [{ role: "user", content: "Hello" }],
      planner: mockPlanner,
      plan: [],
      agents: [mockMessageAgent],
      error: null,
      ...overrides,
    };
  };

  const createMockAgent = <T extends Record<string, unknown>>(
    id: string,
    result: T,
  ): AgentDefinition<AilaState> => ({
    id,
    description: `Mock agent ${id}`,
    handler: jest.fn().mockResolvedValue(result),
  });

  describe("successful execution", () => {
    it("should execute a successful turn with planner and agents", async () => {
      const mockAgent = createMockAgent("testAgent", {
        messages: [
          { role: "assistant", content: "Agent executed successfully" },
        ],
      });

      const state = createMockState({
        agents: [
          {
            id: "messageToUser",
            description: "Message agent",
            handler: jest.fn(),
          },
          mockAgent,
        ],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBeNull();
      expect(state.planner.handler).toHaveBeenCalledWith(state);
      expect(mockAgent.handler).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: [{ agentId: "testAgent", action: "add" }],
        }),
      );
    });

    it("should handle multiple agents in sequence", async () => {
      const mockAgent1 = createMockAgent("agent1", {
        context: ["updated by agent1"],
      });
      const mockAgent2 = createMockAgent("agent2", {
        context: ["updated by agent1", "updated by agent2"],
      });

      const state = createMockState({
        agents: [
          {
            id: "messageToUser",
            description: "Message agent",
            handler: jest.fn(),
          },
          mockAgent1,
          mockAgent2,
        ],
      });

      // Mock planner to return plan with multiple steps
      (state.planner.handler as jest.Mock).mockResolvedValue({
        plan: [
          { agentId: "agent1", action: "add" },
          { agentId: "agent2", action: "replace" },
        ],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBeNull();
      expect(mockAgent1.handler).toHaveBeenCalled();
      expect(mockAgent2.handler).toHaveBeenCalled();
      expect(result.state.context).toEqual([
        "updated by agent1",
        "updated by agent2",
      ]);
    });

    it("should preserve state updates between agent executions", async () => {
      const mockAgent1 = createMockAgent("agent1", {
        doc: { title: "Updated by Agent 1" },
      });
      const mockAgent2 = createMockAgent("agent2", {
        doc: { title: "Updated by Agent 2" },
      });

      const state = createMockState({
        agents: [
          {
            id: "messageToUser",
            description: "Message agent",
            handler: jest.fn(),
          },
          mockAgent1,
          mockAgent2,
        ],
      });

      (state.planner.handler as jest.Mock).mockResolvedValue({
        plan: [
          { agentId: "agent1", action: "add" },
          { agentId: "agent2", action: "replace" },
        ],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBeNull();
      expect(result.state.doc.title).toBe("Updated by Agent 2");
    });
  });

  describe("error handling", () => {
    it("should throw error if messageToUser agent is not found", async () => {
      const state = createMockState({
        agents: [], // No messageToUser agent
      });

      await expect(ailaTurn({ state })).rejects.toThrow(
        "messageToUser agent must be defined",
      );
    });

    it("should handle planner errors gracefully", async () => {
      const mockMessageAgent = createMockAgent("messageToUser", {
        messages: [
          { role: "assistant", content: "Error handled by message agent" },
        ],
      });

      const state = createMockState({
        agents: [mockMessageAgent],
      });

      // Mock planner to return an error
      (state.planner.handler as jest.Mock).mockResolvedValue({
        error: "Planner failed",
        plan: [],
      });

      const result = await ailaTurn({ state });

      // Now that the bug is fixed, handleError should work correctly
      expect(result.state.error).toBe("Planner failed");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error during Aila turn:",
        "Planner failed",
      );
      expect(mockMessageAgent.handler).toHaveBeenCalled();
    });

    it("should handle agent not found error", async () => {
      const mockMessageAgent = createMockAgent("messageToUser", {
        messages: [
          {
            role: "assistant",
            content: "Error handled by message agent",
          },
        ],
      });

      const state = createMockState({
        agents: [mockMessageAgent],
      });

      // Mock planner to return plan with non-existent agent
      (state.planner.handler as jest.Mock).mockResolvedValue({
        plan: [{ agentId: "nonExistentAgent", action: "add" }],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBe("Agent not found: nonExistentAgent");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error during Aila turn:",
        "Agent not found: nonExistentAgent",
      );
      expect(mockMessageAgent.handler).toHaveBeenCalled();
    });

    it("should handle agent execution errors", async () => {
      const mockMessageAgent = createMockAgent("messageToUser", {
        messages: [
          {
            role: "assistant",
            content: "Error handled by message agent",
          },
        ],
      });

      const failingAgent = createMockAgent("failingAgent", {
        error: "Agent execution failed",
      });

      const state = createMockState({
        agents: [mockMessageAgent, failingAgent],
      });

      (state.planner.handler as jest.Mock).mockResolvedValue({
        plan: [{ agentId: "failingAgent", action: "add" }],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBe("Agent execution failed");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error during Aila turn:",
        "Agent execution failed",
      );
      expect(mockMessageAgent.handler).toHaveBeenCalled();
    });

    it("should handle errors in messageToUser agent during error handling", async () => {
      const mockMessageAgent: AgentDefinition<AilaState> = {
        id: "messageToUser",
        description: "Message agent",
        handler: jest.fn().mockRejectedValue(new Error("Message agent failed")),
      };

      const state = createMockState({
        agents: [mockMessageAgent],
      });

      // Mock planner to return an error
      (state.planner.handler as jest.Mock).mockResolvedValue({
        error: "Initial error",
        plan: [],
      });

      const result = await ailaTurn({ state });

      // Now the messageToUser agent is called properly but fails, so we get the fallback error
      expect(result.state.error).toBe(
        "Failed to handle error: Message agent failed",
      );
      expect(result.state.messages).toContainEqual({
        role: "assistant",
        content:
          "Something went wrong while processing your request. Please try again later.",
      });
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error during Aila turn:",
        "Initial error",
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error in messageToUser agent:",
        expect.any(Error),
      );
    });

    it("should handle non-Error objects in messageToUser agent failure", async () => {
      const mockMessageAgent: AgentDefinition<AilaState> = {
        id: "messageToUser",
        description: "Message agent",
        handler: jest.fn().mockRejectedValue("String error"),
      };

      const state = createMockState({
        agents: [mockMessageAgent],
      });

      (state.planner.handler as jest.Mock).mockResolvedValue({
        error: "Initial error",
        plan: [],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBe("Failed to handle error: String error");
    });
  });

  describe("state management", () => {
    it("should not mutate the original state", async () => {
      const originalState = createMockState();

      // Create a deep copy that preserves function references for comparison
      const originalStateForComparison = {
        ...originalState,
        agents: originalState.agents.map((agent) => ({ ...agent })),
        planner: { ...originalState.planner },
        messages: [...originalState.messages],
        context: [...originalState.context],
        plan: [...originalState.plan],
      };

      await ailaTurn({ state: originalState });

      // Check that the original state structure is preserved
      expect(originalState.doc).toEqual(originalStateForComparison.doc);
      expect(originalState.context).toEqual(originalStateForComparison.context);
      expect(originalState.messages).toEqual(
        originalStateForComparison.messages,
      );
      expect(originalState.plan).toEqual(originalStateForComparison.plan);
      expect(originalState.agents.length).toBe(
        originalStateForComparison.agents.length,
      );
      expect(originalState.planner.id).toBe(
        originalStateForComparison.planner.id,
      );
    });

    it("should preserve existing messages when handling errors", async () => {
      const existingMessages = [
        { role: "user" as const, content: "Previous message" },
        { role: "assistant" as const, content: "Previous response" },
      ];

      const mockMessageAgent = createMockAgent("messageToUser", {
        messages: [
          ...existingMessages,
          { role: "assistant", content: "Error response" },
        ],
      });

      const state = createMockState({
        messages: existingMessages,
        agents: [mockMessageAgent],
      });

      (state.planner.handler as jest.Mock).mockResolvedValue({
        error: "Test error",
        plan: [],
      });

      const result = await ailaTurn({ state });

      // Now that the bug is fixed, the messageToUser agent should be called properly
      expect(result.state.messages).toEqual([
        ...existingMessages,
        { role: "assistant", content: "Error response" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty plan", async () => {
      const state = createMockState();

      (state.planner.handler as jest.Mock).mockResolvedValue({
        plan: [],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBeNull();
    });

    it("should handle plan with mixed actions", async () => {
      const addAgent = createMockAgent("addAgent", { context: ["added"] });
      const replaceAgent = createMockAgent("replaceAgent", {
        context: ["replaced"],
      });
      const deleteAgent = createMockAgent("deleteAgent", { context: [] });

      const state = createMockState({
        agents: [
          createMockAgent("messageToUser", {}),
          addAgent,
          replaceAgent,
          deleteAgent,
        ],
      });

      (state.planner.handler as jest.Mock).mockResolvedValue({
        plan: [
          { agentId: "addAgent", action: "add" },
          { agentId: "replaceAgent", action: "replace" },
          { agentId: "deleteAgent", action: "delete" },
        ],
      });

      const result = await ailaTurn({ state });

      expect(result.state.error).toBeNull();
      expect(addAgent.handler).toHaveBeenCalled();
      expect(replaceAgent.handler).toHaveBeenCalled();
      expect(deleteAgent.handler).toHaveBeenCalled();
    });
  });
});
