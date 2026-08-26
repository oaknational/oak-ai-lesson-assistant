import type { PracticeTaskParts } from "./practiceTask";
import {
  MAX_SLIDE_LINES,
  STEPS_POINTER_LINE,
  composeCycleFromResponse,
  composePracticeTask,
  estimateRenderedLines,
} from "./practiceTask";

const contentLines = (count: number, row = "short row of data") =>
  Array.from({ length: count }, (_, i) => `${row} ${i + 1}`).join("\n");

const meditationTask: PracticeTaskParts = {
  instruction:
    "Write a paragraph explaining why meditation matters to many Buddhists.",
  statements: [
    {
      text: "Write one way meditation helps Buddhists in daily life",
      stimulus: null,
    },
    {
      text: "Write one way meditation follows the Buddha's teachings",
      stimulus: null,
    },
    {
      text: "Join your two ideas to say why meditation matters",
      stimulus: null,
    },
  ],
  sharedStimulus: null,
};

describe("estimateRenderedLines", () => {
  it("counts one line per short line and blank separator", () => {
    expect(estimateRenderedLines("one\n\ntwo")).toBe(3);
  });

  it("counts a wrapped long line as two", () => {
    const thirteenWords = Array(13).fill("word").join(" ");
    expect(estimateRenderedLines(thirteenWords)).toBe(2);
  });
});

describe("composePracticeTask rendering", () => {
  it("numbers statements and keeps stimulus-less statements on adjacent lines", () => {
    const { practice } = composePracticeTask(meditationTask);
    expect(practice).toBe(
      [
        "Write a paragraph explaining why meditation matters to many Buddhists.",
        "",
        "1. Write one way meditation helps Buddhists in daily life",
        "2. Write one way meditation follows the Buddha's teachings",
        "3. Join your two ideas to say why meditation matters",
      ].join("\n"),
    );
  });

  it("renders a statement's stimulus directly beneath it", () => {
    const { practice } = composePracticeTask({
      instruction:
        "Identify how Roman settlement changed daily life in Britain.",
      statements: [
        {
          text: "Complete the sentences:",
          stimulus: {
            label: "sentences to complete",
            content: "Roman settlement brought more ______ to Britain.",
          },
        },
        {
          text: "Explain another change Roman settlement brought.",
          stimulus: null,
        },
      ],
      sharedStimulus: null,
    });
    expect(practice).toBe(
      [
        "Identify how Roman settlement changed daily life in Britain.",
        "",
        "1. Complete the sentences:",
        "",
        "Roman settlement brought more ______ to Britain.",
        "",
        "2. Explain another change Roman settlement brought.",
      ].join("\n"),
    );
  });

  it("renders a shared stimulus after the statements", () => {
    const { practice } = composePracticeTask({
      instruction:
        "Explain the impact of the figurative language in the passage.",
      statements: [
        { text: "Identify the adjectives", stimulus: null },
        { text: "Explain the impact on the reader", stimulus: null },
      ],
      sharedStimulus: {
        label: "text extract",
        content:
          "Trapped in a sterile room, she longed to see her family again.",
      },
    });
    expect(
      practice.endsWith(
        "1. Identify the adjectives\n2. Explain the impact on the reader\n\nTrapped in a sterile room, she longed to see her family again.",
      ),
    ).toBe(true);
  });

  it("renders both configurations gracefully when the model emits both", () => {
    const { practice } = composePracticeTask({
      instruction: "Describe the pattern in the results.",
      statements: [
        {
          text: "Complete the sentences:",
          stimulus: {
            label: "sentences to complete",
            content: "The rate is ______.",
          },
        },
      ],
      sharedStimulus: { label: "data table", content: "Time 0 20 40" },
    });
    expect(practice).toContain("The rate is ______.");
    expect(practice.endsWith("Time 0 20 40")).toBe(true);
  });
});

describe("composePracticeTask ladder", () => {
  it("omits both slide fields when the full task fits", () => {
    const result = composePracticeTask(meditationTask);
    expect(result.practiceSlideText).toBeUndefined();
    expect(result.practiceStimulusSlideText).toBeUndefined();
  });

  it("moves an oversized stimulus to the stimulus slide with a next-slide pointer", () => {
    const result = composePracticeTask({
      instruction: "Describe how the rate of this reaction changes over time.",
      statements: [
        {
          text: "Complete the sentences:",
          stimulus: {
            label: "sentences to complete",
            content: contentLines(8),
          },
        },
        { text: "Explain why the rate changes.", stimulus: null },
      ],
      sharedStimulus: null,
    });
    expect(result.practiceSlideText).toContain(
      "You will find the sentences to complete on the next slide.",
    );
    expect(result.practiceSlideText).not.toContain("short row of data");
    expect(result.practiceStimulusSlideText).toContain("For step 1:");
    expect(result.practiceStimulusSlideText).toContain("short row of data 8");
    expect(
      estimateRenderedLines(result.practiceSlideText ?? ""),
    ).toBeLessThanOrEqual(MAX_SLIDE_LINES);
    expect(
      estimateRenderedLines(result.practiceStimulusSlideText ?? ""),
    ).toBeLessThanOrEqual(MAX_SLIDE_LINES);
  });

  it("moves the largest stimulus first and keeps smaller ones inline", () => {
    const result = composePracticeTask({
      instruction: "Explain the changes shown in the sources.",
      statements: [
        {
          text: "Explain the change in the first source:",
          stimulus: {
            label: "text extract",
            content: contentLines(8, "long source line"),
          },
        },
        {
          text: "Explain the change in the second source:",
          stimulus: {
            label: "data table",
            content: contentLines(2, "small table row"),
          },
        },
      ],
      sharedStimulus: null,
    });
    expect(result.practiceSlideText).toContain(
      "You will find the text extract on the next slide.",
    );
    expect(result.practiceSlideText).toContain("small table row 1");
    expect(result.practiceStimulusSlideText).toContain("long source line 1");
    expect(result.practiceStimulusSlideText).not.toContain("small table row");
  });

  it("sends stimuli to the worksheet when they overflow their own slide", () => {
    const result = composePracticeTask({
      instruction: "Explain the impact of the passage on the reader.",
      statements: [
        {
          text: "Use the passage to explain the impact:",
          stimulus: { label: "text extract", content: contentLines(14) },
        },
      ],
      sharedStimulus: null,
    });
    expect(result.practiceSlideText).toContain(
      "You will find the text extract on the worksheet.",
    );
    expect(result.practiceStimulusSlideText).toBeUndefined();
  });

  it("replaces overlong statements with the steps pointer as a last resort", () => {
    const result = composePracticeTask({
      instruction: "Sort the events of the Roman invasion into order.",
      statements: Array.from({ length: 13 }, (_, i) => ({
        text: `Sort event number ${i + 1} into the timeline`,
        stimulus: null,
      })),
      sharedStimulus: null,
    });
    expect(result.practiceSlideText).toBe(
      [
        "Sort the events of the Roman invasion into order.",
        "",
        STEPS_POINTER_LINE,
      ].join("\n"),
    );
    expect(result.practiceStimulusSlideText).toBeUndefined();
  });

  it("gives a moved shared stimulus no heading when it is alone", () => {
    const result = composePracticeTask({
      instruction: "Explain the impact of the passage on the reader.",
      statements: [
        { text: "Identify the adjectives", stimulus: null },
        { text: "Explain the impact using full sentences", stimulus: null },
      ],
      sharedStimulus: { label: "text extract", content: contentLines(9) },
    });
    expect(result.practiceSlideText).toContain(
      "You will find the text extract on the next slide.",
    );
    expect(result.practiceStimulusSlideText).not.toContain("For ");
    expect(
      result.practiceStimulusSlideText?.startsWith("short row of data 1"),
    ).toBe(true);
  });
});

describe("composeCycleFromResponse", () => {
  it("swaps the parts for composed strings and keeps other fields", () => {
    const composed = composeCycleFromResponse({
      title: "Rates of reaction",
      practice: meditationTask,
    });
    expect(composed.title).toBe("Rates of reaction");
    expect(typeof composed.practice).toBe("string");
    expect(composed).not.toHaveProperty("practiceSlideText");
    expect(composed).not.toHaveProperty("practiceStimulusSlideText");
  });

  it("includes the slide fields only when composition produced them", () => {
    const composed = composeCycleFromResponse({
      practice: {
        instruction: "Describe the pattern in the results.",
        statements: [
          {
            text: "Complete the sentences:",
            stimulus: {
              label: "sentences to complete" as const,
              content: contentLines(9),
            },
          },
        ],
        sharedStimulus: null,
      },
    });
    expect(composed.practiceSlideText).toContain("on the next slide");
    expect(composed.practiceStimulusSlideText).toContain("For step 1:");
  });
});
