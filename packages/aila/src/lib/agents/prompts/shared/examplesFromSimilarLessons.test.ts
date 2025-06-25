import { examplesFromSimilarLessons } from "./examplesFromSimilarLessons";

interface MockLesson {
  id: string;
  title: string;
  content?: string;
  description?: string;
}

describe("examplesFromSimilarLessons", () => {
  const mockLessons: MockLesson[] = [
    {
      id: "1",
      title: "Lesson 1",
      content: "This is lesson 1 content",
      description: "A basic lesson",
    },
    {
      id: "2",
      title: "Lesson 2",
      content: "This is lesson 2 content",
      description: "Another lesson",
    },
    {
      id: "3",
      title: "Lesson 3",
      // No content field
      description: "Lesson without content",
    },
  ];

  const extractContent = (lesson: MockLesson): string | null => {
    return lesson.content ?? null;
  };

  const extractDescription = (lesson: MockLesson): string | null => {
    return lesson.description ?? null;
  };

  it("should format examples correctly with valid data", () => {
    const result = examplesFromSimilarLessons(
      mockLessons,
      "content",
      extractContent,
    );

    expect(result).toBe(
      `<example-content-0>\nThis is lesson 1 content\n</example-content-0>\n\n<example-content-1>\nThis is lesson 2 content\n</example-content-1>`,
    );
  });

  it("should use the correct targetKey in the example tags", () => {
    const result = examplesFromSimilarLessons(
      mockLessons.slice(0, 1),
      "quiz",
      extractContent,
    );

    expect(result).toBe(
      `<example-quiz-0>\nThis is lesson 1 content\n</example-quiz-0>`,
    );
  });

  it("should filter out lessons where extractRagDataAsText returns null", () => {
    const result = examplesFromSimilarLessons(
      mockLessons,
      "content",
      extractContent,
    );

    // Should only include lessons 1 and 2, not lesson 3 (which has no content)
    expect(result).toContain("This is lesson 1 content");
    expect(result).toContain("This is lesson 2 content");
    expect(result).not.toContain("Lesson without content");
  });

  it("should return 'No relevant examples found.' when no lessons have extractable data", () => {
    const lessonsWithoutContent = [
      { id: "1", title: "Lesson 1", description: "A lesson" },
      { id: "2", title: "Lesson 2", description: "Another lesson" },
    ];

    const result = examplesFromSimilarLessons(
      lessonsWithoutContent,
      "content",
      extractContent,
    );

    expect(result).toBe("No relevant examples found.");
  });

  it("should return 'No relevant examples found.' when lessons array is empty", () => {
    const result = examplesFromSimilarLessons([], "content", extractContent);

    expect(result).toBe("No relevant examples found.");
  });

  it("should handle different extraction functions", () => {
    const result = examplesFromSimilarLessons(
      mockLessons,
      "description",
      extractDescription,
    );

    expect(result).toContain("A basic lesson");
    expect(result).toContain("Another lesson");
    expect(result).toContain("Lesson without content");
    expect(result).toContain("<example-description-0>");
    expect(result).toContain("<example-description-1>");
    expect(result).toContain("<example-description-2>");
  });

  it("should handle lessons with empty string content", () => {
    const lessonsWithEmptyContent = [
      { id: "1", title: "Lesson 1", content: "" },
      { id: "2", title: "Lesson 2", content: "Valid content" },
    ];

    const extractContentOrEmpty = (lesson: MockLesson): string | null => {
      return lesson.content === "" ? null : lesson.content ?? null;
    };

    const result = examplesFromSimilarLessons(
      lessonsWithEmptyContent,
      "content",
      extractContentOrEmpty,
    );

    expect(result).toBe(
      `<example-content-0>\nValid content\n</example-content-0>`,
    );
  });

  it("should maintain correct indexing when filtering", () => {
    const mixedLessons = [
      { id: "1", title: "Lesson 1" }, // No content
      { id: "2", title: "Lesson 2", content: "Content 2" },
      { id: "3", title: "Lesson 3" }, // No content
      { id: "4", title: "Lesson 4", content: "Content 4" },
    ];

    const result = examplesFromSimilarLessons(
      mixedLessons,
      "test",
      extractContent,
    );

    expect(result).toBe(
      `<example-test-0>\nContent 2\n</example-test-0>\n\n<example-test-1>\nContent 4\n</example-test-1>`,
    );
  });

  it("should handle special characters in content", () => {
    const lessonsWithSpecialChars = [
      {
        id: "1",
        title: "Lesson 1",
        content: "Content with <tags>, quotes \"test\", and & symbols",
      },
    ];

    const result = examplesFromSimilarLessons(
      lessonsWithSpecialChars,
      "special",
      extractContent,
    );

    expect(result).toBe(
      `<example-special-0>\nContent with <tags>, quotes "test", and & symbols\n</example-special-0>`,
    );
  });

  it("should work with different generic types", () => {
    interface DifferentLesson {
      name: string;
      data: string;
    }

    const differentLessons: DifferentLesson[] = [
      { name: "Test", data: "Some data" },
      { name: "Another", data: "More data" },
    ];

    const extractData = (lesson: DifferentLesson): string | null => {
      return lesson.data;
    };

    const result = examplesFromSimilarLessons(
      differentLessons,
      "data",
      extractData,
    );

    expect(result).toBe(
      `<example-data-0>\nSome data\n</example-data-0>\n\n<example-data-1>\nMore data\n</example-data-1>`,
    );
  });

  it("should handle multiline content correctly", () => {
    const lessonsWithMultilineContent = [
      {
        id: "1",
        title: "Lesson 1",
        content: "Line 1\nLine 2\nLine 3",
      },
    ];

    const result = examplesFromSimilarLessons(
      lessonsWithMultilineContent,
      "multiline",
      extractContent,
    );

    expect(result).toBe(
      `<example-multiline-0>\nLine 1\nLine 2\nLine 3\n</example-multiline-0>`,
    );
  });
});