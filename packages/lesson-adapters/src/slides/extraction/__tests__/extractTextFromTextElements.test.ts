import type { GoogleSlidesTextElement } from "@oakai/gsuite";

import { extractTextFromTextElements } from "../extractTextFromTextElements";

describe("extractTextFromTextElements", () => {
  it("returns undefined when textElements is undefined", () => {
    const result = extractTextFromTextElements(undefined);
    expect(result).toBeUndefined();
  });

  it("returns undefined when textElements is an empty array", () => {
    const result = extractTextFromTextElements([]);
    expect(result).toBeUndefined();
  });

  it("extracts text from a single text element", () => {
    const textElements: GoogleSlidesTextElement[] = [
      {
        textRun: {
          content: "Hello World",
        },
      },
    ];

    const result = extractTextFromTextElements(textElements);
    expect(result).toBe("Hello World");
  });

  it("concatenates text from multiple text elements", () => {
    const textElements: GoogleSlidesTextElement[] = [
      {
        textRun: {
          content: "Hello ",
        },
      },
      {
        textRun: {
          content: "World",
        },
      },
    ];

    const result = extractTextFromTextElements(textElements);
    expect(result).toBe("Hello World");
  });

  it("handles text elements with missing textRun", () => {
    const textElements: GoogleSlidesTextElement[] = [
      {
        textRun: {
          content: "Before ",
        },
      },
      {
        // Element without textRun (e.g., paragraph marker)
      },
      {
        textRun: {
          content: "After",
        },
      },
    ];

    const result = extractTextFromTextElements(textElements);
    expect(result).toBe("Before After");
  });

  it("handles text elements with textRun but missing content", () => {
    const textElements: GoogleSlidesTextElement[] = [
      {
        textRun: {
          content: "Text ",
        },
      },
      {
        textRun: {
          // content is undefined
        },
      },
      {
        textRun: {
          content: "here",
        },
      },
    ];

    const result = extractTextFromTextElements(textElements);
    expect(result).toBe("Text here");
  });

  it("preserves internal newlines but trims outer whitespace", () => {
    const textElements: GoogleSlidesTextElement[] = [
      {
        textRun: {
          content: "Line 1\n",
        },
      },
      {
        textRun: {
          content: "Line 2",
        },
      },
    ];

    const result = extractTextFromTextElements(textElements);
    expect(result).toBe("Line 1\nLine 2");
  });

  it("handles mixed text elements with paragraph markers", () => {
    // Google Slides typically includes paragraph markers as separate elements
    const textElements: GoogleSlidesTextElement[] = [
      {
        paragraphMarker: {
          style: {},
        },
      },
      {
        textRun: {
          content: "Bullet point text\n",
        },
      },
    ];

    const result = extractTextFromTextElements(textElements);
    expect(result).toBe("Bullet point text");
  });
});
