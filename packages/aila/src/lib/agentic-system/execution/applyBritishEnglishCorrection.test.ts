import { z } from "zod";

import { AMERICANISM_ISSUE_KIND } from "../../../features/americanisms";
import type { SectionKey } from "../schema";
import type { AilaExecutionContext } from "../types";
import { applyBritishEnglishCorrection } from "./applyBritishEnglishCorrection";

/**
 * These tests exercise the helper against the real `AilaAmericanisms` detector
 * so we cover the integration between filtering rules and the corrector flow.
 * Test inputs use phrases known to produce stable flags from the underlying
 * `american-british-english-translator` dictionary:
 *   - "color" / "recognize"  -> SPELLING
 *   - "eraser"               -> PHRASING
 *   - "construction"         -> MEANING (advisory; should be skipped)
 */

function createContext(corrector: jest.Mock): AilaExecutionContext {
  return {
    persistedState: {
      messages: [],
      initialDocument: {},
      relevantLessons: null,
    },
    runtime: {
      britishEnglishCorrectorAgent: corrector,
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
    },
    callbacks: {} as AilaExecutionContext["callbacks"],
  };
}

const TITLE: SectionKey = "title";

describe("applyBritishEnglishCorrection", () => {
  it("returns null and skips the corrector when no Americanisms are detected", async () => {
    const corrector = jest.fn();
    const context = createContext(corrector);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "An introduction to fractions",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(corrector).not.toHaveBeenCalled();
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("invokes the corrector and returns validated corrected content for a spelling flag", async () => {
    const corrector = jest.fn().mockResolvedValue({
      error: null,
      data: "This will recognise the colour",
    });
    const context = createContext(corrector);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(corrector).toHaveBeenCalledTimes(1);
    expect(result).toBe("This will recognise the colour");
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("invokes the corrector for a phrasing flag (eraser)", async () => {
    const corrector = jest.fn().mockResolvedValue({
      error: null,
      data: "Use a rubber to erase",
    });
    const context = createContext(corrector);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "Use an eraser to erase",
      responseSchema: z.string(),
    });

    expect(corrector).toHaveBeenCalledTimes(1);
    expect(result).toBe("Use a rubber to erase");
  });

  it("skips the corrector when only MEANING-class flags are detected", async () => {
    const corrector = jest.fn();
    const context = createContext(corrector);

    // "construction" reliably flags as MEANING only (advisory).
    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "construction",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(corrector).not.toHaveBeenCalled();
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("returns null without leaking a user-facing note when the corrector errors", async () => {
    const corrector = jest.fn().mockResolvedValue({
      error: { message: "model refused" },
    });
    const context = createContext(corrector);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("returns null without leaking a user-facing note when the corrector returns schema-invalid content", async () => {
    const corrector = jest.fn().mockResolvedValue({
      error: null,
      data: 42, // not a string — fails responseSchema
    });
    const context = createContext(corrector);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("swallows corrector promise rejections so the turn keeps streaming", async () => {
    const corrector = jest.fn().mockRejectedValue(new Error("network timeout"));
    const context = createContext(corrector);

    const result = await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "This will recognize the color",
      responseSchema: z.string(),
    });

    expect(result).toBeNull();
    expect(context.currentTurn.notes).toEqual([]);
  });

  it("passes only actionable issues to the corrector", async () => {
    let capturedIssues: Array<{ issue: string }> = [];
    const corrector = jest.fn().mockImplementation((props: unknown) => {
      const typed = props as { issues: Array<{ issue: string }> };
      capturedIssues = typed.issues;
      return Promise.resolve({
        error: null,
        data: "Triangle construction recognises the colour",
      });
    });
    const context = createContext(corrector);

    // Mix MEANING ("construction", "triangle") with SPELLING ("recognize", "color").
    await applyBritishEnglishCorrection({
      context,
      sectionKey: TITLE,
      content: "Triangle construction will recognize the color",
      responseSchema: z.string(),
    });

    expect(corrector).toHaveBeenCalledTimes(1);
    expect(
      capturedIssues.every((i) => i.issue !== AMERICANISM_ISSUE_KIND.MEANING),
    ).toBe(true);
    expect(capturedIssues.length).toBeGreaterThan(0);
  });
});
