import { createAilaTurnCallbacks } from "./ailaTurnCallbacks";

describe("ailaTurnCallbacks", () => {
  test("onPlannerComplete", () => {
    let chunks = "";
    const { onPlannerComplete } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
        enqueue: jest.fn().mockResolvedValue(undefined),
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    onPlannerComplete({
      sectionKeys: ["subject", "title", "keyLearningPoints"],
    });

    expect(chunks).toEqual(
      `{"type":"llmMessage","sectionsToEdit":["subject","title","keyLearningPoints"],"patches":[`,
    );
  });
  test("onSectionComplete", () => {
    let chunks = "";
    const { onSectionComplete } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
        enqueue: jest.fn().mockResolvedValue(undefined),
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    onSectionComplete([{ op: "add", path: "/subject", value: "art" }]);
    expect(chunks).toEqual(
      `{"type":"patch","reasoning":"Updated subject based on user request","value":{"op":"add","path":"/subject","value":"art"},"status":"complete"}`,
    );
  });
  test("onTurnComplete", async () => {
    let chunks = "";
    const enqueue = jest.fn().mockResolvedValue(undefined);
    const { onTurnComplete } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
        enqueue,
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    await onTurnComplete({
      stepsExecuted: [],
      document: { subject: "art" },
      ailaMessage: "We've updated the subject, title, and key learning points",
    });
    expect(chunks).toEqual(
      `],"sectionsEdited":[],"prompt":{"type":"text","value":"We've updated the subject, title, and key learning points"},"status":"complete"}`,
    );
    expect(enqueue).toHaveBeenCalledWith({
      type: "state",
      reasoning: "final",
      value: { subject: "art" },
    });
  });

  test("onTurnFailed does not enqueue final state", async () => {
    let chunks = "";
    const enqueue = jest.fn().mockResolvedValue(undefined);
    const { onTurnFailed } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
        enqueue,
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    await onTurnFailed({
      stepsExecuted: [],
      ailaMessage:
        "I wasn't able to complete that lesson update. Please try again.",
    });

    expect(chunks).toEqual(
      `],"sectionsEdited":[],"prompt":{"type":"text","value":"I wasn't able to complete that lesson update. Please try again."},"status":"complete"}`,
    );
    expect(enqueue).toHaveBeenCalledWith({
      type: "comment",
      value: "AGENTIC_TURN_FAILED",
    });
  });

  test("onSectionComplete with multiple patches", () => {
    let chunks = "";
    const { onSectionComplete } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
        enqueue: jest.fn().mockResolvedValue(undefined),
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    onSectionComplete([
      { op: "replace", path: "/subject", value: "chemistry" },
      { op: "add", path: "/title", value: "Introduction to Chemistry" },
    ]);

    const patchesJson = `[${chunks}]`;
    const patches = JSON.parse(patchesJson) as {
      value: { op: string; path: string };
    }[];

    expect(patches).toHaveLength(2);
    expect(patches[0]?.value.op).toBe("replace");
    expect(patches[0]?.value.path).toBe("/subject");
    expect(patches[1]?.value.op).toBe("add");
    expect(patches[1]?.value.path).toBe("/title");
  });

  test("all callbacks together", async () => {
    let chunks = "";
    const { onPlannerComplete, onSectionComplete, onTurnComplete } =
      createAilaTurnCallbacks({
        chat: {
          appendChunk: (chunk) => {
            chunks = chunks + chunk;
          },
          enqueue: jest.fn().mockResolvedValue(undefined),
        },
        controller: {
          enqueue: jest.fn(),
        } as unknown as ReadableStreamDefaultController,
      });

    onPlannerComplete({
      sectionKeys: ["subject", "title"],
    });
    onSectionComplete([
      { op: "add", path: "/subject", value: "art" },
      { op: "add", path: "/title", value: "Goethe's Colour Wheel" },
    ]);
    await onTurnComplete({
      stepsExecuted: [
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
      document: {
        subject: "art",
        title: "Goethe's Colour Wheel",
      },
      ailaMessage: "We've updated the subject and title",
    });

    expect(JSON.parse(chunks)).toMatchObject({
      type: "llmMessage",
      sectionsToEdit: ["subject", "title"],
      patches: [
        {
          type: "patch",
          reasoning: "Updated subject based on user request",
          value: { op: "add", path: "/subject", value: "art" },
          status: "complete",
        },
        {
          type: "patch",
          reasoning: "Updated title based on user request",
          value: { op: "add", path: "/title", value: "Goethe's Colour Wheel" },
          status: "complete",
        },
      ],
      sectionsEdited: ["subject", "title"],
      prompt: {
        type: "text",
        value: "We've updated the subject and title",
      },
      status: "complete",
    });
  });
});
