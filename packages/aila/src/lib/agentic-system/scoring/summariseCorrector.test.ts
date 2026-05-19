import type { SectionKey } from "../schema";
import type { CorrectorStats } from "../types";
import { summariseCorrector } from "./summariseCorrector";

const TITLE: SectionKey = "title";
const SUBJECT: SectionKey = "subject";
const CYCLE1: SectionKey = "cycle1";
const STARTER_QUIZ: SectionKey = "starterQuiz";

const empty: CorrectorStats = { attempted: [], notNeeded: [], failed: [] };

describe("summariseCorrector — unit", () => {
  it("returns zeros and 0.0% rates when given no runs", () => {
    expect(summariseCorrector([])).toEqual({
      corrections_attempted: 0,
      corrections_not_needed: 0,
      corrections_failed: 0,
      correction_rate: "0.0%",
      correction_failure_rate: "0.0%",
      corrections_by_section: {},
    });
  });

  it("returns zeros and 0.0% rates when every run is empty", () => {
    expect(summariseCorrector([empty, empty, empty])).toEqual({
      corrections_attempted: 0,
      corrections_not_needed: 0,
      corrections_failed: 0,
      correction_rate: "0.0%",
      correction_failure_rate: "0.0%",
      corrections_by_section: {},
    });
  });

  it("collapses correction_failure_rate to 0.0% when nothing was attempted (division by zero defence)", () => {
    const summary = summariseCorrector([
      { attempted: [], notNeeded: [TITLE, SUBJECT], failed: [] },
    ]);
    expect(summary.corrections_attempted).toBe(0);
    expect(summary.correction_rate).toBe("0.0%");
    expect(summary.correction_failure_rate).toBe("0.0%");
  });

  it("counts a single attempt with no failures", () => {
    const summary = summariseCorrector([
      { attempted: [CYCLE1], notNeeded: [TITLE, SUBJECT], failed: [] },
    ]);
    expect(summary).toEqual({
      corrections_attempted: 1,
      corrections_not_needed: 2,
      corrections_failed: 0,
      correction_rate: "33.3%",
      correction_failure_rate: "0.0%",
      corrections_by_section: { cycle1: 1 },
    });
  });

  it("computes a non-trivial failure rate when some attempts fail", () => {
    const summary = summariseCorrector([
      {
        attempted: [CYCLE1, STARTER_QUIZ],
        notNeeded: [TITLE],
        failed: [{ sectionKey: STARTER_QUIZ, reason: "schema-invalid" }],
      },
    ]);
    expect(summary.corrections_attempted).toBe(2);
    expect(summary.corrections_failed).toBe(1);
    expect(summary.correction_rate).toBe("66.7%");
    expect(summary.correction_failure_rate).toBe("50.0%");
  });

  it("counts all failure reasons toward corrections_failed regardless of kind", () => {
    const summary = summariseCorrector([
      {
        attempted: [TITLE, SUBJECT, CYCLE1],
        notNeeded: [],
        failed: [
          { sectionKey: TITLE, reason: "threw" },
          { sectionKey: SUBJECT, reason: "errored" },
          { sectionKey: CYCLE1, reason: "schema-invalid" },
        ],
      },
    ]);
    expect(summary.corrections_failed).toBe(3);
    expect(summary.correction_failure_rate).toBe("100.0%");
  });

  it("tallies corrections_by_section, summing duplicates within a run", () => {
    const summary = summariseCorrector([
      {
        attempted: [CYCLE1, CYCLE1, STARTER_QUIZ],
        notNeeded: [TITLE],
        failed: [],
      },
    ]);
    expect(summary.corrections_by_section).toEqual({
      cycle1: 2,
      starterQuiz: 1,
    });
  });
});

describe("summariseCorrector — multi-run aggregation (harness integration shape)", () => {
  it("flattens stats across multiple runs of a scenario into one summary", () => {
    // Simulates what `afterAll` does: each scenario has N runs, each run has
    // its own CorrectorStats, summariseCorrector concatenates them.
    const runs: CorrectorStats[] = [
      // Run 1: clean except for one cycle1 fire
      {
        attempted: [CYCLE1],
        notNeeded: [TITLE, SUBJECT, STARTER_QUIZ],
        failed: [],
      },
      // Run 2: completely clean
      {
        attempted: [],
        notNeeded: [TITLE, SUBJECT, CYCLE1, STARTER_QUIZ],
        failed: [],
      },
      // Run 3: starterQuiz fired and failed (errored)
      {
        attempted: [STARTER_QUIZ],
        notNeeded: [TITLE, SUBJECT, CYCLE1],
        failed: [{ sectionKey: STARTER_QUIZ, reason: "errored" }],
      },
    ];

    expect(summariseCorrector(runs)).toEqual({
      corrections_attempted: 2,
      corrections_not_needed: 10,
      corrections_failed: 1,
      correction_rate: "16.7%", // 2 / (2 + 10)
      correction_failure_rate: "50.0%", // 1 / 2
      corrections_by_section: {
        cycle1: 1,
        starterQuiz: 1,
      },
    });
  });

  it("accumulates corrections_by_section across runs (same section firing twice)", () => {
    // The harness allows the same section to fire across multiple runs;
    // each occurrence increments its count in the by-section tally.
    const runs: CorrectorStats[] = [
      { attempted: [CYCLE1], notNeeded: [], failed: [] },
      { attempted: [CYCLE1], notNeeded: [], failed: [] },
      { attempted: [CYCLE1, STARTER_QUIZ], notNeeded: [], failed: [] },
    ];

    expect(summariseCorrector(runs).corrections_by_section).toEqual({
      cycle1: 3,
      starterQuiz: 1,
    });
  });

  it("produces a YAML-ready shape — keys, types, and rate string format", () => {
    // End-to-end shape check matching what lands in scores.yaml under
    // `summary.<scenario>.americanisms_corrector`.
    const summary = summariseCorrector([
      {
        attempted: [STARTER_QUIZ],
        notNeeded: Array(32).fill(TITLE) as SectionKey[],
        failed: [],
      },
    ]);

    expect(summary).toEqual({
      corrections_attempted: expect.any(Number),
      corrections_not_needed: expect.any(Number),
      corrections_failed: expect.any(Number),
      correction_rate: expect.stringMatching(/^\d+\.\d%$/),
      correction_failure_rate: expect.stringMatching(/^\d+\.\d%$/),
      corrections_by_section: expect.any(Object),
    });
    expect(summary.correction_rate).toBe("3.0%"); // 1 / 33
  });
});
