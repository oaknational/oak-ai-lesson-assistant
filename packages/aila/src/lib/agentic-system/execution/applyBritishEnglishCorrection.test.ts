import { z } from "zod/v3";

import { AMERICANISM_ISSUE_KIND } from "../../../features/americanisms";
import { createEmptyCorrectorStats } from "../correctorStats";
import type { SectionKey } from "../schema";
import type { AilaExecutionContext } from "../types";
import { applyBritishEnglishCorrection } from "./applyBritishEnglishCorrection";

/**
 * Real `AilaAmericanisms` detector with a mocked corrector agent. Inputs use
 * phrases that `american-british-english-translator` classifies consistently
 * across dictionary versions, so the tests stay reproducible:
 *   - "color" / "recognize" -> SPELLING
 *   - "eraser"              -> PHRASING
 *   - "construction"        -> MEANING (advisory, skipped)
 */

function createContext(correctorAgent: jest.Mock): AilaExecutionContext {
  return {
    persistedState: {
      messages: [],
      initialDocument: {},
      relevantLessons: null,
      ragFetched: { status: "not_fetched", searchIdentity: null },
    },
    runtime: {
      britishEnglishCorrectorAgent: correctorAgent,
    } as unknown as AilaExecutionContext["runtime"],
    currentTurn: {
      document: {},
      plannerOutput: null,
      errors: [],
      notes: [],
      stepsExecuted: [],
      relevantLessons: null,
      relevantLessonsFetched: false,
      currentStep: null,
      correctorStats: createEmptyCorrectorStats(),
    },
    callbacks: {} as AilaExecutionContext["callbacks"],
  };
}

const TITLE: SectionKey = "title";

describe("applyBritishEnglishCorrection", () => {
  it("returns null and skips the corrector when no Americanisms are detected", async () => {
    const correctorAgent = jest.fn();
    const context = createContext(correctorAgent);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "An introduction to fractions",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(correctorAgent).not.toHaveBeenCalled();
    expect(context.currentTurn.notes).toEqual([]);
    expect(context.currentTurn.correctorStats.attempted).toEqual([]);
    expect(context.currentTurn.correctorStats.notNeeded).toEqual([TITLE]);
    expect(context.currentTurn.correctorStats.failed).toEqual([]);
  });

  it("invokes the corrector and returns validated corrected content for a spelling flag", async () => {
    const correctorAgent = jest.fn().mockResolvedValue({
      error: null,
      data: "This will recognise the colour",
    });
    const context = createContext(correctorAgent);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(correctorAgent).toHaveBeenCalledTimes(1);
    expect(result).toBe("This will recognise the colour");
    expect(context.currentTurn.notes).toEqual([]);
    expect(context.currentTurn.correctorStats.attempted).toEqual([TITLE]);
    expect(context.currentTurn.correctorStats.failed).toEqual([]);
  });

  it("invokes the corrector for a phrasing flag (eraser)", async () => {
    const correctorAgent = jest.fn().mockResolvedValue({
      error: null,
      data: "Use a rubber to erase",
    });
    const context = createContext(correctorAgent);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "Use an eraser to erase",
      responseSchema: z.string(),
    });

    expect(correctorAgent).toHaveBeenCalledTimes(1);
    expect(result).toBe("Use a rubber to erase");
  });

  it("skips the corrector when only MEANING-class flags are detected", async () => {
    const correctorAgent = jest.fn();
    const context = createContext(correctorAgent);

    // "construction" reliably flags as MEANING only
    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "construction",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(correctorAgent).not.toHaveBeenCalled();
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("returns null without leaking a user-facing note when the corrector errors", async () => {
    const correctorAgent = jest.fn().mockResolvedValue({
      error: { message: "model refused" },
    });
    const context = createContext(correctorAgent);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(context.currentTurn.notes).toEqual([]);
    expect(context.currentTurn.correctorStats.failed).toEqual([
      { sectionKey: TITLE, reason: "errored" },
    ]);
  });

  it("returns null without leaking a user-facing note when the corrector returns schema-invalid content", async () => {
    const correctorAgent = jest.fn().mockResolvedValue({
      error: null,
      data: 42, // not a string — fails responseSchema
    });
    const context = createContext(correctorAgent);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(context.currentTurn.notes).toEqual([]);
    expect(context.currentTurn.correctorStats.failed).toEqual([
      { sectionKey: TITLE, reason: "schema-invalid" },
    ]);
  });

  it("swallows corrector promise rejections so the turn keeps streaming", async () => {
    const correctorAgent = jest
      .fn()
      .mockRejectedValue(new Error("network timeout"));
    const context = createContext(correctorAgent);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(context.currentTurn.notes).toEqual([]);
    expect(context.currentTurn.correctorStats.failed).toEqual([
      { sectionKey: TITLE, reason: "threw" },
    ]);
  });

  it("passes only actionable issues to the corrector", async () => {
    let capturedIssues: Array<{ issue: string }> = [];
    const correctorAgent = jest.fn().mockImplementation((props: unknown) => {
      const typed = props as { issues: Array<{ issue: string }> };
      capturedIssues = typed.issues;
      return Promise.resolve({
        error: null,
        data: "Triangle construction recognises the colour",
      });
    });
    const context = createContext(correctorAgent);

    // Mix MEANING ("construction", "triangle") with SPELLING ("recognize", "color").
    await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "Triangle construction will recognize the color",
      responseSchema: z.string(),
    });

    expect(correctorAgent).toHaveBeenCalledTimes(1);
    expect(
      capturedIssues.every((i) => i.issue !== AMERICANISM_ISSUE_KIND.MEANING),
    ).toBe(true);
    expect(capturedIssues.length).toBeGreaterThan(0);
  });
});
