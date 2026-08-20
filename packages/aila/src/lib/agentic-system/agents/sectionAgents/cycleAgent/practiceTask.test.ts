import type { PracticeTaskParts } from "./practiceTask";
import {
  MAX_SLIDE_LINES,
  STIMULUS_TYPES,
  composeCycleFromResponse,
  composePracticeTask,
  estimateRenderedLines,
} from "./practiceTask";

const shortTask: PracticeTaskParts = {
  instruction: "Describe how the rate of this reaction changes over time.",
  chunking: [
    "describe the rate in the first 20 seconds",
    "describe why the rate changes",
  ],
  stimulus: null,
  scaffolding: null,
};

const longStimulus = {
  label: "data table" as const,
  content: [
    "Time (s)      0    20    40    60    80   100",
    "Volume (cm3)  0    18    31    40    44    45",
    "Mass (g)      10   9.8   9.6   9.5   9.5   9.5",
    "Temp (C)      20   24    27    29    30    30",
    "Colour        clear cloudy cloudy white white white",
    "Bubbles       none  many  many  some  few   none",
    "pH            7     6     6     5     5     5",
  ].join("\n"),
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

describe("composePracticeTask", () => {
  it("joins the parts with blank lines in the full task", () => {
    const { practice } = composePracticeTask({
      ...shortTask,
      stimulus: { label: "calculations", content: "4 + 4 =\n5 + 12 =" },
      scaffolding: "Use these words: rate, reactant.",
    });
    expect(practice).toBe(
      [
        "Describe how the rate of this reaction changes over time.",
        "",
        "- describe the rate in the first 20 seconds",
        "- describe why the rate changes",
        "",
        "4 + 4 =",
        "5 + 12 =",
        "",
        "Use these words: rate, reactant.",
      ].join("\n"),
    );
  });

  it("omits the slide text when the full task fits", () => {
    const result = composePracticeTask(shortTask);
    expect(result.practiceSlideText).toBeUndefined();
  });

  it("replaces oversized stimulus with the worksheet pointer", () => {
    const { practice, practiceSlideText } = composePracticeTask({
      ...shortTask,
      stimulus: longStimulus,
      scaffolding: "Use these words: rate, reactant, used up.",
    });
    expect(practice).toContain("Volume (cm3)");
    expect(practiceSlideText).toContain(
      "You will find the data table on the worksheet.",
    );
    expect(practiceSlideText).not.toContain("Volume (cm3)");
    // scaffolding still fits, so it survives the trim
    expect(practiceSlideText).toContain("Use these words");
    expect(estimateRenderedLines(practiceSlideText ?? "")).toBeLessThanOrEqual(
      MAX_SLIDE_LINES,
    );
  });

  it("drops scaffolding before chunking when the pointer is not enough", () => {
    const { practiceSlideText } = composePracticeTask({
      instruction: "Describe the pattern in the results.",
      chunking: Array(8).fill("describe one feature of the pattern"),
      stimulus: longStimulus,
      scaffolding: "Use these words: rate, reactant, used up, particles.",
    });
    expect(practiceSlideText).not.toContain("Use these words");
    expect(practiceSlideText).toContain("describe one feature");
  });

  it("replaces chunking with the steps pointer as a last resort", () => {
    const { practiceSlideText } = composePracticeTask({
      instruction: "Describe the pattern in the results.",
      chunking: Array(14).fill("describe one feature of the pattern"),
      stimulus: longStimulus,
      scaffolding: null,
    });
    expect(practiceSlideText).toContain(
      "You will find the steps on the worksheet.",
    );
    expect(practiceSlideText).toContain(
      "You will find the data table on the worksheet.",
    );
    expect(practiceSlideText).not.toContain("describe one feature");
    expect(estimateRenderedLines(practiceSlideText ?? "")).toBeLessThanOrEqual(
      MAX_SLIDE_LINES,
    );
  });

  it("builds a pointer sentence for every stimulus type", () => {
    for (const label of STIMULUS_TYPES) {
      const { practiceSlideText } = composePracticeTask({
        ...shortTask,
        chunking: Array(6).fill("describe one feature of the pattern"),
        stimulus: { label, content: longStimulus.content },
      });
      expect(practiceSlideText).toContain(
        `You will find the ${label} on the worksheet.`,
      );
    }
  });
});

describe("composeCycleFromResponse", () => {
  it("swaps the parts for composed strings and keeps other fields", () => {
    const composed = composeCycleFromResponse({
      title: "Rates of reaction",
      practice: shortTask,
    });
    expect(composed.title).toBe("Rates of reaction");
    expect(typeof composed.practice).toBe("string");
    expect(composed).not.toHaveProperty("practiceSlideText");
  });

  it("includes practiceSlideText only when the task was trimmed", () => {
    const composed = composeCycleFromResponse({
      practice: {
        ...shortTask,
        stimulus: longStimulus,
        scaffolding: "Use these words: rate, reactant, used up.",
      },
    });
    expect(composed.practiceSlideText).toContain(
      "You will find the data table on the worksheet.",
    );
  });
});
