import { ailaTurn } from "./ailaTurn";
import type {
  AilaExecutionContext,
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
} from "./types";

function createCallbacks() {
  return {
    onPlannerComplete: jest.fn(),
    onSectionComplete: jest.fn(),
    onRagFetchedChange: jest.fn(),
    onTurnComplete: jest.fn().mockResolvedValue(undefined),
    onTurnFailed: jest.fn().mockResolvedValue(undefined),
  } satisfies AilaTurnCallbacks;
}

function createPersistedState(): AilaPersistedState {
  return {
    messages: [{ id: "u1", role: "user", content: "Update the subject" }],
    initialDocument: {},
    relevantLessons: null,
    ragFetched: { status: "not_fetched", searchIdentity: null },
  };
}

function createRuntime(
  overrides: Partial<AilaRuntimeContext> = {},
): AilaRuntimeContext {
  return {
    config: { mathsQuizEnabled: true },
    plannerAgent: jest.fn(),
    sectionAgents: {} as AilaRuntimeContext["sectionAgents"],
    messageToUserAgent: jest.fn(),
    britishEnglishCorrectorAgent: jest.fn(),
    fetchRelevantLessons: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("ailaTurn", () => {
  const originalForceFail = process.env.AILA_AGENTIC_FORCE_FAIL;

  afterEach(() => {
    if (originalForceFail === undefined) {
      delete process.env.AILA_AGENTIC_FORCE_FAIL;
    } else {
      process.env.AILA_AGENTIC_FORCE_FAIL = originalForceFail;
    }
  });

  it("returns empty corrector stats on hard failures before section execution", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest
        .fn()
        .mockResolvedValue({ error: { message: "planner failed" } }),
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toEqual({
      status: "failed",
      correctorStats: { attempted: [], notNeeded: [], failed: [] },
    });
  });

  it("returns corrector stats for successful section execution", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the subject",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "art",
          }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toEqual({
      status: "success",
      correctorStats: { attempted: [], notNeeded: ["subject"], failed: [] },
    });
  });

  it("emits the corrected section content when the corrector fires", async () => {
    const callbacks = createCallbacks();
    const britishEnglishCorrectorAgent = jest.fn().mockResolvedValue({
      error: null,
      data: "Introduction to colour theory",
    });
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the title",
          plan: [
            {
              type: "section",
              sectionKey: "title",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "title--default": {
          id: "title--default",
          description: "title",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "Introduction to color theory",
          }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
      britishEnglishCorrectorAgent,
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(britishEnglishCorrectorAgent).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({
      status: "success",
      correctorStats: { attempted: ["title"], notNeeded: [], failed: [] },
    });
    expect(callbacks.onSectionComplete).toHaveBeenCalledWith([
      { op: "add", path: "/title", value: "Introduction to colour theory" },
    ]);
  });

  it("emits the original section content when the corrector fails", async () => {
    const callbacks = createCallbacks();
    const britishEnglishCorrectorAgent = jest
      .fn()
      .mockResolvedValue({ error: { message: "corrector failed" } });
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the title",
          plan: [
            {
              type: "section",
              sectionKey: "title",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "title--default": {
          id: "title--default",
          description: "title",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "Introduction to color theory",
          }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
      britishEnglishCorrectorAgent,
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(britishEnglishCorrectorAgent).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({
      status: "success",
      correctorStats: {
        attempted: ["title"],
        notNeeded: [],
        failed: [{ sectionKey: "title", reason: "errored" }],
      },
    });
    expect(callbacks.onSectionComplete).toHaveBeenCalledWith([
      { op: "add", path: "/title", value: "Introduction to color theory" },
    ]);
  });

  it("hard-fails when the planner fails", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest
        .fn()
        .mockResolvedValue({ error: { message: "planner failed" } }),
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "failed" });
    expect(callbacks.onPlannerComplete).toHaveBeenCalledWith({
      sectionKeys: [],
    });
    expect(callbacks.onTurnFailed).toHaveBeenCalledWith({
      stepsExecuted: [],
      ailaMessage:
        "I wasn't able to complete that lesson update. Please try again.",
    });
    expect(callbacks.onTurnComplete).not.toHaveBeenCalled();
  });

  it("hard-fails when a section agent fails", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the subject",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest
            .fn()
            .mockResolvedValue({ error: { message: "section failed" } }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "failed" });
    expect(callbacks.onPlannerComplete).toHaveBeenCalledWith({
      sectionKeys: ["subject"],
    });
    expect(callbacks.onTurnFailed).toHaveBeenCalledWith({
      stepsExecuted: [],
      ailaMessage:
        "I wasn't able to complete that lesson update. Please try again.",
    });
    expect(callbacks.onTurnComplete).not.toHaveBeenCalled();
  });

  it("persists partial success when a later section agent fails", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the lesson",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
            {
              type: "section",
              sectionKey: "title",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "art",
          }),
        },
        "title--default": {
          id: "title--default",
          description: "title",
          handler: jest
            .fn()
            .mockResolvedValue({ error: { message: "title failed" } }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "success" });
    expect(callbacks.onSectionComplete).toHaveBeenCalledWith([
      { op: "add", path: "/subject", value: "art" },
    ]);
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith({
      stepsExecuted: [
        {
          type: "section",
          sectionKey: "subject",
          action: "generate",
          sectionInstructions: null,
        },
      ],
      document: { subject: "art" },
      ailaMessage:
        "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.",
    });
    expect(callbacks.onTurnFailed).not.toHaveBeenCalled();
  });

  it("salvages a message-to-user failure after successful edits", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the subject",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "art",
          }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
      messageToUserAgent: jest
        .fn()
        .mockResolvedValue({ error: { message: "message agent failed" } }),
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "success" });
    expect(callbacks.onSectionComplete).toHaveBeenCalledWith([
      { op: "add", path: "/subject", value: "art" },
    ]);
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith({
      stepsExecuted: [
        {
          type: "section",
          sectionKey: "subject",
          action: "generate",
          sectionInstructions: null,
        },
      ],
      document: { subject: "art" },
      ailaMessage:
        "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.",
    });
    expect(callbacks.onTurnFailed).not.toHaveBeenCalled();
  });

  it.each([
    { label: "null", relevantLessons: null },
    { label: "empty", relevantLessons: [] },
  ])(
    "strips a basedOn step the planner produced when relevant lessons are $label",
    async ({ relevantLessons }) => {
      const callbacks = createCallbacks();
      const basedOnHandler = jest.fn();
      const runtime = createRuntime({
        plannerAgent: jest.fn().mockResolvedValue({
          error: null,
          data: {
            decision: "plan",
            parsedUserMessage: "Update the subject",
            plan: [
              {
                type: "section",
                sectionKey: "basedOn",
                action: "generate",
                sectionInstructions: null,
              },
              {
                type: "section",
                sectionKey: "subject",
                action: "generate",
                sectionInstructions: null,
              },
            ],
          },
        }),
        sectionAgents: {
          "basedOn--default": {
            id: "basedOn--default",
            description: "basedOn",
            handler: basedOnHandler,
          },
          "subject--default": {
            id: "subject--default",
            description: "subject",
            handler: jest.fn().mockResolvedValue({ error: null, data: "art" }),
          },
        } as unknown as AilaRuntimeContext["sectionAgents"],
      });

      await ailaTurn({
        persistedState: { ...createPersistedState(), relevantLessons },
        runtime,
        callbacks,
      });

      expect(callbacks.onPlannerComplete).toHaveBeenCalledWith({
        sectionKeys: ["subject"],
      });
      expect(basedOnHandler).not.toHaveBeenCalled();
    },
  );

  it("keeps a basedOn step when relevant lessons exist", async () => {
    const callbacks = createCallbacks();
    const basedOnHandler = jest.fn().mockResolvedValue({
      error: null,
      data: { id: "lp1", title: "Angles in triangles" },
    });
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Use the first lesson",
          plan: [
            {
              type: "section",
              sectionKey: "basedOn",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "basedOn--default": {
          id: "basedOn--default",
          description: "basedOn",
          handler: basedOnHandler,
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    await ailaTurn({
      persistedState: {
        ...createPersistedState(),
        relevantLessons: [
          {
            ragLessonPlanId: "lp1",
            oakLessonId: 1,
            oakLessonSlug: "angles-in-triangles",
            lessonPlan: { title: "Angles in triangles" },
          },
        ],
      },
      runtime,
      callbacks,
    });

    expect(callbacks.onPlannerComplete).toHaveBeenCalledWith({
      sectionKeys: ["basedOn"],
    });
    expect(basedOnHandler).toHaveBeenCalled();
  });

  it("supports forced planner failures via env var", async () => {
    process.env.AILA_AGENTIC_FORCE_FAIL = "planner";

    const callbacks = createCallbacks();
    const plannerAgent = jest.fn().mockResolvedValue({
      error: null,
      data: {
        decision: "exit",
        parsedUserMessage: "unused",
        reasonType: "clarification_needed",
        reasonJustification: "unused",
        additionalInfo: null,
      },
    });
    const runtime = createRuntime({ plannerAgent });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "failed" });
    expect(plannerAgent).not.toHaveBeenCalled();
    expect(callbacks.onTurnFailed).toHaveBeenCalled();
  });

  it("supports forced planner throws via env var", async () => {
    process.env.AILA_AGENTIC_FORCE_FAIL = "planner_throw";

    const callbacks = createCallbacks();
    const plannerAgent = jest.fn();
    const runtime = createRuntime({ plannerAgent });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "failed" });
    expect(plannerAgent).not.toHaveBeenCalled();
    expect(callbacks.onTurnFailed).toHaveBeenCalledWith({
      stepsExecuted: [],
      ailaMessage:
        "I wasn't able to complete that lesson update. Please try again.",
    });
    expect(callbacks.onTurnComplete).not.toHaveBeenCalled();
  });

  it("supports forced section throws via env var", async () => {
    process.env.AILA_AGENTIC_FORCE_FAIL = "section_throw:subject";

    const callbacks = createCallbacks();
    const sectionHandler = jest.fn();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the subject",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: sectionHandler,
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "failed" });
    expect(sectionHandler).not.toHaveBeenCalled();
    expect(callbacks.onTurnFailed).toHaveBeenCalledWith({
      stepsExecuted: [],
      ailaMessage:
        "I wasn't able to complete that lesson update. Please try again.",
    });
    expect(callbacks.onTurnComplete).not.toHaveBeenCalled();
  });

  it("supports forced message-to-user failures via env var", async () => {
    process.env.AILA_AGENTIC_FORCE_FAIL = "message_to_user";

    const callbacks = createCallbacks();
    const messageToUserAgent = jest.fn();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the subject",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "art",
          }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
      messageToUserAgent,
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "success" });
    expect(messageToUserAgent).not.toHaveBeenCalled();
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith({
      stepsExecuted: [
        {
          type: "section",
          sectionKey: "subject",
          action: "generate",
          sectionInstructions: null,
        },
      ],
      document: { subject: "art" },
      ailaMessage:
        "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.",
    });
  });

  it("supports forced message-to-user throws via env var", async () => {
    process.env.AILA_AGENTIC_FORCE_FAIL = "message_to_user_throw";

    const callbacks = createCallbacks();
    const messageToUserAgent = jest.fn();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the subject",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "art",
          }),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
      messageToUserAgent,
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "success" });
    expect(messageToUserAgent).not.toHaveBeenCalled();
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith({
      stepsExecuted: [
        {
          type: "section",
          sectionKey: "subject",
          action: "generate",
          sectionInstructions: null,
        },
      ],
      document: { subject: "art" },
      ailaMessage:
        "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.",
    });
    expect(callbacks.onTurnFailed).not.toHaveBeenCalled();
  });

  it("persists partial success when a later section throws", async () => {
    const callbacks = createCallbacks();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Update the lesson",
          plan: [
            {
              type: "section",
              sectionKey: "subject",
              action: "generate",
              sectionInstructions: null,
            },
            {
              type: "section",
              sectionKey: "title",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "subject--default": {
          id: "subject--default",
          description: "subject",
          handler: jest.fn().mockResolvedValue({
            error: null,
            data: "art",
          }),
        },
        "title--default": {
          id: "title--default",
          description: "title",
          handler: jest.fn().mockRejectedValue(new Error("title threw")),
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    const outcome = await ailaTurn({
      persistedState: createPersistedState(),
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "success" });
    expect(callbacks.onTurnComplete).toHaveBeenCalledWith({
      stepsExecuted: [
        {
          type: "section",
          sectionKey: "subject",
          action: "generate",
          sectionInstructions: null,
        },
      ],
      document: { subject: "art" },
      ailaMessage:
        "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.",
    });
    expect(callbacks.onTurnFailed).not.toHaveBeenCalled();
  });

  it("runs group 4 in canonical order and passes committed cycle context forward", async () => {
    const callbacks = createCallbacks();
    const callOrder: string[] = [];

    const starterQuizHandler = jest.fn().mockImplementation(() => {
      callOrder.push("starterQuiz");
      return Promise.resolve({ error: null, data: makeQuiz("Starter Q") });
    });
    const cycleHandler = jest
      .fn()
      .mockImplementation((ctx: AilaExecutionContext) => {
        const sectionKey = ctx.currentTurn.currentStep?.sectionKey;
        if (!sectionKey) throw new Error("Expected current step");
        callOrder.push(sectionKey);

        if (sectionKey === "cycle2") {
          expect(ctx.currentTurn.document.cycle1?.title).toBe(
            "Generated cycle 1",
          );
        }
        if (sectionKey === "cycle3") {
          expect(ctx.currentTurn.document.cycle1?.title).toBe(
            "Generated cycle 1",
          );
          expect(ctx.currentTurn.document.cycle2?.title).toBe(
            "Generated cycle 2",
          );
        }

        return Promise.resolve({
          error: null,
          data: makeCycle(
            sectionKey === "cycle1"
              ? "Generated cycle 1"
              : sectionKey === "cycle2"
                ? "Generated cycle 2"
                : "Generated cycle 3",
          ),
        });
      });
    const exitQuizHandler = jest
      .fn()
      .mockImplementation((ctx: AilaExecutionContext) => {
        callOrder.push("exitQuiz");
        expect(ctx.currentTurn.document.cycle1?.title).toBe(
          "Generated cycle 1",
        );
        expect(ctx.currentTurn.document.cycle2?.title).toBe(
          "Generated cycle 2",
        );
        expect(ctx.currentTurn.document.cycle3?.title).toBe(
          "Generated cycle 3",
        );
        return Promise.resolve({ error: null, data: makeQuiz("Exit Q") });
      });

    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Generate lesson body",
          plan: [
            {
              type: "section",
              sectionKey: "cycle2",
              action: "generate",
              sectionInstructions: null,
            },
            {
              type: "section",
              sectionKey: "exitQuiz",
              action: "generate",
              sectionInstructions: null,
            },
            {
              type: "section",
              sectionKey: "cycle1",
              action: "generate",
              sectionInstructions: null,
            },
            {
              type: "section",
              sectionKey: "starterQuiz",
              action: "generate",
              sectionInstructions: null,
            },
            {
              type: "section",
              sectionKey: "cycle3",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "starterQuiz--default": {
          id: "starterQuiz--default",
          description: "starter quiz",
          handler: starterQuizHandler,
        },
        "cycle--default": {
          id: "cycle--default",
          description: "cycle",
          handler: cycleHandler,
        },
        "exitQuiz--default": {
          id: "exitQuiz--default",
          description: "exit quiz",
          handler: exitQuizHandler,
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    await ailaTurn({
      persistedState: {
        ...createPersistedState(),
        initialDocument: {
          learningCycles: ["Outcome 1", "Outcome 2", "Outcome 3"],
        },
      },
      runtime,
      callbacks,
    });

    expect(callOrder).toEqual([
      "starterQuiz",
      "cycle1",
      "cycle2",
      "cycle3",
      "exitQuiz",
    ]);
    expect(callbacks.onPlannerComplete).toHaveBeenCalledWith({
      sectionKeys: ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
    });
  });

  it("hard-fails cleanly when a cycle has no matching learning cycle outcome", async () => {
    const callbacks = createCallbacks();
    const cycleHandler = jest.fn();
    const runtime = createRuntime({
      plannerAgent: jest.fn().mockResolvedValue({
        error: null,
        data: {
          decision: "plan",
          parsedUserMessage: "Generate cycle 2",
          plan: [
            {
              type: "section",
              sectionKey: "cycle2",
              action: "generate",
              sectionInstructions: null,
            },
          ],
        },
      }),
      sectionAgents: {
        "cycle--default": {
          id: "cycle--default",
          description: "cycle",
          handler: cycleHandler,
        },
      } as unknown as AilaRuntimeContext["sectionAgents"],
    });

    const outcome = await ailaTurn({
      persistedState: {
        ...createPersistedState(),
        initialDocument: { learningCycles: ["Only outcome"] },
      },
      runtime,
      callbacks,
    });

    expect(outcome).toMatchObject({ status: "failed" });
    expect(cycleHandler).not.toHaveBeenCalled();
    expect(callbacks.onTurnFailed).toHaveBeenCalledWith({
      stepsExecuted: [],
      ailaMessage:
        "I wasn't able to complete that lesson update. Please try again.",
    });
    expect(callbacks.onTurnComplete).not.toHaveBeenCalled();
  });
});

function makeQuiz(question: string) {
  return {
    version: "v3" as const,
    questions: [
      {
        questionType: "multiple-choice" as const,
        question,
        hint: null,
        answers: ["Correct answer"],
        distractors: ["Wrong answer 1", "Wrong answer 2"],
      },
    ],
    imageMetadata: [],
  };
}

function makeCycle(title: string) {
  return {
    title,
    durationInMinutes: 10,
    explanation: {
      spokenExplanation: ["Explain the key idea"],
      accompanyingSlideDetails: "A supporting diagram",
      imagePrompt: "supporting diagram",
      slideText: "Key idea",
    },
    checkForUnderstanding: [
      {
        question: "Question 1?",
        answers: ["Answer"],
        distractors: ["Wrong 1", "Wrong 2"],
      },
      {
        question: "Question 2?",
        answers: ["Answer"],
        distractors: ["Wrong 1", "Wrong 2"],
      },
    ],
    practice: "Complete the practice task.",
    feedback: "Check against the model answer.",
  };
}
