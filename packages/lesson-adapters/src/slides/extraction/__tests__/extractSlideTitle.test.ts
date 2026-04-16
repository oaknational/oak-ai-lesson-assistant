import { extractSlideTitle } from "../extractSlideTitle";
import type { SlideTextElement } from "../types";

describe("extractSlideTitle", () => {
  it("returns the content when exactly one TITLE placeholder exists", () => {
    const textElements: SlideTextElement[] = [
      { id: "1", content: "My Slide Title", placeholderType: "TITLE" },
      { id: "2", content: "Body text", placeholderType: "BODY" },
    ];

    const result = extractSlideTitle(textElements, "Layout Name");
    expect(result.slideTitle).toBe("My Slide Title");
  });

  it("returns concatenated titles when 2 TITLE placeholders exist", () => {
    const textElements: SlideTextElement[] = [
      { id: "1", content: "Title 1", placeholderType: "TITLE" },
      { id: "2", content: "Title 2", placeholderType: "TITLE" },
    ];

    const result = extractSlideTitle(textElements, "Section Header");
    expect(result.slideTitle).toBe("Title 1 - Title 2");
  });

  it("returns undefined when multiple TITLE placeholders exist and no layoutName", () => {
    const textElements: SlideTextElement[] = [
      { id: "1", content: "Text 1", placeholderType: "BODY" },
      { id: "2", content: "Text 2", placeholderType: "BODY" },
      { id: "3", content: "Text 3", placeholderType: "BODY" },
    ];

    const result = extractSlideTitle(textElements, undefined);
    expect(result.slideTitle).toBe("Text 1");
  });

  it("returns undefined when text elements array is empty", () => {
    const result = extractSlideTitle([], "Layout Name");
    expect(result.slideTitle).toBeUndefined();
  });

  it("returns layout name when more than 2 TITLE placeholders exist", () => {
    const textElements: SlideTextElement[] = [
      { id: "1", content: "Title 1", placeholderType: "TITLE" },
      { id: "2", content: "Title 2", placeholderType: "TITLE" },
      { id: "3", content: "Title 3", placeholderType: "TITLE" },
    ];

    const result = extractSlideTitle(textElements, "Layout Name");
    expect(result.slideTitle).toBe("Layout Name");
  });

  it("returns CENTERED_TITLE content when such a placeholder exists", () => {
    const textElements: SlideTextElement[] = [
      { id: "1", content: "CENTERED_TITLE", placeholderType: "TITLE" },
      { id: "2", content: "Some other text", placeholderType: "BODY" },
    ];

    const result = extractSlideTitle(textElements, "Layout Name");
    expect(result.slideTitle).toBe("CENTERED_TITLE");
  });
});
