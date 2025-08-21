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

    // Parse the result to check it's valid JSON
    const patches = chunks
      .split('{"type":"patch"')
      .slice(1)
      .map((chunk) => {
        return JSON.parse('{"type":"patch"' + chunk);
      });

    // Should have multiple patches for the various changes
    expect(patches.length).toBeGreaterThan(1);

    // Check that we have patches for different types of operations
    const operations = patches.map((patch) => patch.value.op);
    expect(operations).toContain("replace"); // subject change
    expect(operations).toContain("add"); // new fields

    // Check that nested paths are handled correctly
    const paths = patches.map((patch) => patch.value.path);
    expect(paths).toContain("/subject");
    expect(paths).toContain("/title");
    expect(paths).toContain("/keyLearningPoints");

    // Should have nested paths for learningObjective changes
    const nestedPaths = paths.filter((path) =>
      path.startsWith("/learningObjective"),
    );
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
    onSectionComplete({}, { subject: "art" });
    onSectionComplete(
      { subject: "art" },
      { subject: "art", title: "Goethe's Colour Wheel" },
    );
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
