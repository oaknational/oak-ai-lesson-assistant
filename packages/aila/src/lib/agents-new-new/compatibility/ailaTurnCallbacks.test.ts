import { createAilaTurnCallbacks } from "./ailaTurnCallbacks";

describe("ailaTurnCallbacks", () => {
  test("onPlannerComplete", () => {
    let chunks = "";
    const { onPlannerComplete } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
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
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    onSectionComplete({}, { subject: "art" });
    expect(chunks).toEqual(
      `{"type":"patch","reasoning":"Updated subject based on user request","value":{"op":"add","path":"/subject","value":"art"},"status":"complete"}`,
    );
  });
  test("onTurnComplete", () => {
    let chunks = "";
    const { onTurnComplete } = createAilaTurnCallbacks({
      chat: {
        appendChunk: (chunk) => {
          chunks = chunks + chunk;
        },
      },
      controller: {
        enqueue: jest.fn(),
      } as unknown as ReadableStreamDefaultController,
    });

    onTurnComplete({
      prevDoc: {},
      nextDoc: { subject: "art" },
      ailaMessage: "We've updated the subject, title, and key learning points",
    });
    expect(chunks).toEqual(
      `],"sectionsEdited":[],"prompt":{"type":"text","value":"We've updated the subject, title, and key learning points"},"status":"complete"}`,
    );
  });

  test.only("all callbacks together", () => {
    let chunks = "";
    const { onPlannerComplete, onSectionComplete, onTurnComplete } =
      createAilaTurnCallbacks({
        chat: {
          appendChunk: (chunk) => {
            chunks = chunks + chunk;
          },
        },
        controller: {
          enqueue: jest.fn(),
        } as unknown as ReadableStreamDefaultController,
      });

    onPlannerComplete({
      sectionKeys: ["subject", "title", "keyLearningPoints"],
    });
    onSectionComplete({}, { subject: "art" });
    onSectionComplete(
      { subject: "art" },
      { subject: "art", title: "Goethe's Colour Wheel" },
    );
    onSectionComplete(
      { subject: "art", title: "Goethe's Colour Wheel" },
      {
        subject: "art",
        title: "Goethe's Colour Wheel",
        keyLearningPoints: ["An introduction to Goethe's Colour Wheel"],
      },
    );
    onTurnComplete({
      prevDoc: {},
      nextDoc: {
        subject: "art",
        title: "Goethe's Colour Wheel",
        keyLearningPoints: ["An introduction to Goethe's Colour Wheel"],
      },
      ailaMessage: "We've updated the subject, title, and key learning points",
    });
    console.log(chunks);
    expect(JSON.parse(chunks)).toMatchObject({
      type: "llmMessage",
      sectionsToEdit: ["subject", "title", "keyLearningPoints"],
      patches: [
        {
          type: "patch",
          reasoning: "Updated subject based on user request",
          value: { op: "add", path: "/subject", value: "art" },
          status: "complete",
        },
      ],
      sectionsEdited: [],
      prompt: {
        type: "text",
        value: "We've updated the subject, title, and key learning points",
      },
      status: "complete",
    });
  });
});
