import type { PartialLessonPlan } from "../../../protocol/schema";
import {
  type MeaningEntry,
  collectMeaningOccurrences,
  extractAmericanMeaning,
  extractSnippet,
  formatMeaningEvidence,
} from "./scoreAgenticIssues.helpers";

describe("extractAmericanMeaning", () => {
  it("returns the American English value when present", () => {
    expect(extractAmericanMeaning({ "American English": "queue" })).toBe(
      "queue",
    );
  });

  it("returns an empty string when the key is missing", () => {
    expect(extractAmericanMeaning({ Other: "thing" })).toBe("");
  });
});

describe("extractSnippet", () => {
  it("returns the sentence containing the phrase", () => {
    const text = "First sentence. The phrase is here. Last one.";
    expect(extractSnippet(text, "phrase")).toBe("The phrase is here.");
  });

  it("matches case-insensitively", () => {
    expect(extractSnippet("Look at the LINE here.", "line")).toBe(
      "Look at the LINE here.",
    );
  });

  it("returns an empty string when the phrase is not found", () => {
    expect(extractSnippet("nothing matches here.", "absent")).toBe("");
  });

  it("uses word boundaries (does not match within a longer word)", () => {
    expect(extractSnippet("The lineage is here.", "line")).toBe("");
  });

  it("handles text without terminal punctuation", () => {
    expect(extractSnippet("trailing line", "line")).toBe("trailing line");
  });
});

describe("collectMeaningOccurrences", () => {
  const finalDocument = {
    learningOutcome: "Draw a line on the page.",
    priorKnowledge: "The line on the chart slopes up.",
  } as unknown as PartialLessonPlan;

  it("returns an empty map for empty input", () => {
    expect(collectMeaningOccurrences([], finalDocument).size).toBe(0);
  });

  it("groups occurrences of the same phrase across sections", () => {
    const result = collectMeaningOccurrences(
      [
        {
          section: "learningOutcome",
          phrase: "line",
          details: { "American English": "queue" },
        },
        {
          section: "priorKnowledge",
          phrase: "line",
          details: { "American English": "queue" },
        },
      ],
      finalDocument,
    );
    expect(result.size).toBe(1);
    const entry = result.get("line");
    expect(entry?.occurrences.map((o) => o.section)).toEqual([
      "learningOutcome",
      "priorKnowledge",
    ]);
    expect(entry?.meaning).toBe("queue");
  });

  it("preserves the first-seen meaning when later issues lack one", () => {
    const result = collectMeaningOccurrences(
      [
        {
          section: "learningOutcome",
          phrase: "line",
          details: { "American English": "queue" },
        },
        { section: "priorKnowledge", phrase: "line", details: {} },
      ],
      finalDocument,
    );
    expect(result.get("line")?.meaning).toBe("queue");
  });

  it("populates each occurrence's snippet from the matching section", () => {
    const result = collectMeaningOccurrences(
      [
        {
          section: "learningOutcome",
          phrase: "line",
          details: { "American English": "queue" },
        },
        {
          section: "priorKnowledge",
          phrase: "line",
          details: { "American English": "queue" },
        },
      ],
      finalDocument,
    );
    const occurrences = result.get("line")?.occurrences ?? [];
    expect(occurrences[0]?.snippet).toBe("Draw a line on the page.");
    expect(occurrences[1]?.snippet).toBe("The line on the chart slopes up.");
  });
});

describe("formatMeaningEvidence", () => {
  it("returns an empty string for an empty map", () => {
    expect(formatMeaningEvidence(new Map())).toBe("");
  });

  it("renders header, US meaning, and snippet for a single entry", () => {
    const map = new Map<string, MeaningEntry>([
      [
        "line",
        {
          occurrences: [
            { section: "learningOutcome", snippet: "Draw a line on the page" },
          ],
          meaning: "queue",
        },
      ],
    ]);
    expect(formatMeaningEvidence(map)).toBe(
      `- "line" [learningOutcome]\n  US: queue\n  learningOutcome: "...Draw a line on the page..."`,
    );
  });

  it("lists all sections in the header even when snippets are deduplicated", () => {
    const map = new Map<string, MeaningEntry>([
      [
        "line",
        {
          occurrences: [
            { section: "learningOutcome", snippet: "Same sentence" },
            { section: "priorKnowledge", snippet: "Same sentence" },
          ],
          meaning: "queue",
        },
      ],
    ]);
    const out = formatMeaningEvidence(map);
    expect(out).toContain(`- "line" [learningOutcome, priorKnowledge]`);
    expect(out.match(/Same sentence/g)?.length).toBe(1);
  });

  it("omits the US line when meaning is empty", () => {
    const map = new Map<string, MeaningEntry>([
      [
        "x",
        {
          occurrences: [{ section: "s", snippet: "snip" }],
          meaning: "",
        },
      ],
    ]);
    expect(formatMeaningEvidence(map)).toBe(`- "x" [s]\n  s: "...snip..."`);
  });

  it("collapses newlines in the US meaning to spaces", () => {
    const map = new Map<string, MeaningEntry>([
      [
        "x",
        {
          occurrences: [{ section: "s", snippet: "snip" }],
          meaning: "first line\nsecond line",
        },
      ],
    ]);
    expect(formatMeaningEvidence(map)).toContain("US: first line second line");
  });

  it("skips occurrences with empty snippets but keeps them in the section list", () => {
    const map = new Map<string, MeaningEntry>([
      [
        "x",
        {
          occurrences: [
            { section: "s1", snippet: "" },
            { section: "s2", snippet: "real" },
          ],
          meaning: "m",
        },
      ],
    ]);
    expect(formatMeaningEvidence(map)).toBe(
      `- "x" [s1, s2]\n  US: m\n  s2: "...real..."`,
    );
  });
});
