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

  test("onSectionComplete with multiple sections and nested changes", () => {
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

    // Test with multiple sections changing and nested objects
    const prevDoc = {
      subject: "science",
      learningObjective: {
        title: "Understanding atoms",
        pupils: {
          will: ["identify atoms"],
          can: ["draw atomic structure"],
        },
      },
    };

    const nextDoc = {
      subject: "chemistry", // Changed
      title: "Introduction to Chemistry", // Added
      learningObjective: {
        title: "Understanding molecules", // Changed nested
        pupils: {
          will: ["identify molecules", "understand bonding"], // Changed nested array
          can: ["draw molecular structure"], // Changed nested
          should: ["apply knowledge"], // Added nested
        },
      },
      keyLearningPoints: ["Basic chemistry concepts"], // Added
    };

    onSectionComplete(prevDoc, nextDoc);

    // The raw chunks should be valid JSON patches separated by commas
    // Let's parse them as a JSON array by wrapping in brackets
    const patchesJson = `[${chunks}]`;
    const patches = JSON.parse(patchesJson);

    // Should have multiple patches for the various changes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(patches.length).toBeGreaterThan(1);

    // Check that we have patches for different types of operations
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    const operations = patches.map((patch: any) => patch.value.op);
    expect(operations).toContain("replace"); // subject change
    expect(operations).toContain("add"); // new fields

    // Check that nested paths are handled correctly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    const paths = patches.map((patch: any) => patch.value.path);
    expect(paths).toContain("/subject");
    expect(paths).toContain("/title");
    expect(paths).toContain("/keyLearningPoints");

    // Should have nested paths for learningObjective changes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const nestedPaths = paths.filter(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      (path: any) => path.startsWith("/learningObjective"),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(nestedPaths.length).toBeGreaterThan(0);
  });

  test("all callbacks together", () => {
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
    onSectionComplete(
      {},
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
        {
          type: "patch",
          reasoning: "Updated title based on user request",
          value: { op: "add", path: "/title", value: "Goethe's Colour Wheel" },
          status: "complete",
        },
        {
          type: "patch",
          reasoning: "Updated keyLearningPoints based on user request",
          value: {
            op: "add",
            path: "/keyLearningPoints",
            value: ["An introduction to Goethe's Colour Wheel"],
          },
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
