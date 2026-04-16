// Import the module to spy on
import * as getGenerationModule from "../../aiProviders/getGeneration";
import { generatePartialLessonPlanObject } from "./generateLessonPlan";
import type { PartialLessonContextSchemaType } from "./schema";
import { lessonFieldKeys } from "./schema";

// Mock only the AI provider, not the prompt building logic
jest.mock("../../aiProviders/getGeneration");

describe("generatePartialLessonPlanObject", () => {
  const mockGetLLMGeneration =
    getGenerationModule.getLLMGeneration as jest.MockedFunction<
      typeof getGenerationModule.getLLMGeneration
    >;

  const mockLessonPlanResponse = {
    title: "Test Lesson",
    learningOutcome: "Students will learn about test concepts",
    learningCycles: [
      {
        title: "Introduction",
        durationInMinutes: 10,
        explanation: "Introduction to the topic",
      },
    ],
  };

  beforeEach(() => {
    mockGetLLMGeneration.mockResolvedValue(mockLessonPlanResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call getLLMGeneration with correct prompt, system message, and schema", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "5",
      lessonParts: ["title", "learningOutcome"],
      subject: "Maths",
      title: "Test Lesson",
    };

    await generatePartialLessonPlanObject({
      parsedInput: { context },
      provider: "openai",
    });

    expect(mockGetLLMGeneration).toHaveBeenCalledTimes(1);
    expect(mockGetLLMGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(
          "Write a lesson plan for a class of pupils in the UK in year group 5",
        ),
        systemMessage: expect.stringContaining("Subject: Maths, year group 5"),
        schema: expect.any(Object),
      }),
      "openai",
    );
  });

  it("should use default provider when none specified", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "5",
      lessonParts: ["title"],
      subject: "Maths",
      title: "Test Lesson",
    };

    await generatePartialLessonPlanObject({
      parsedInput: { context },
    });

    expect(mockGetLLMGeneration).toHaveBeenCalledWith(
      expect.any(Object),
      "openai", // default provider
    );
  });

  it("should sort lessonParts according to lessonFieldKeys order", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "5",
      lessonParts: [lessonFieldKeys[3], lessonFieldKeys[1], lessonFieldKeys[0]], // out of order
      subject: "Maths",
      title: "Test Lesson",
    };

    await generatePartialLessonPlanObject({ parsedInput: { context } });

    expect(mockGetLLMGeneration).toHaveBeenCalledTimes(1);
    const callArgs = mockGetLLMGeneration.mock.calls[0]?.[0];
    expect(callArgs).toBeDefined();
    expect(callArgs?.prompt).toContain(`**${lessonFieldKeys[0]}**`);

    // Verify the prompt contains the fields in the correct order
    const promptContent = callArgs?.prompt ?? "";
    const titleIndex = promptContent.indexOf(`**${lessonFieldKeys[0]}**`);
    const keystageIndex = promptContent.indexOf(`**${lessonFieldKeys[1]}**`);
    const learningOutcomeIndex = promptContent.indexOf(
      `**${lessonFieldKeys[3]}**`,
    );

    expect(titleIndex).toBeLessThan(keystageIndex);
    expect(keystageIndex).toBeLessThan(learningOutcomeIndex);
  });

  it("should handle different providers correctly", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "7",
      lessonParts: ["title"],
      subject: "Science",
      title: "Photosynthesis",
    };

    await generatePartialLessonPlanObject({
      parsedInput: { context },
      provider: "openai", // Use valid provider
    });

    expect(mockGetLLMGeneration).toHaveBeenCalledWith(
      expect.any(Object),
      "openai",
    );
  });

  it("should create schema with only requested lesson parts", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "8",
      lessonParts: ["title", "learningOutcome"],
      subject: "History",
      title: "World War II",
    };

    await generatePartialLessonPlanObject({
      parsedInput: { context },
    });

    const callArgs = mockGetLLMGeneration.mock.calls[0]?.[0];
    expect(callArgs).toBeDefined();
    const schema = callArgs?.schema;

    // Verify schema structure by checking the keys
    expect(schema).toBeDefined();

    // Test that required fields are accepted
    const parseResult = schema?.safeParse({
      title: "test",
      learningOutcome: "test outcome",
    });
    expect(parseResult?.success).toBe(true);

    // Test that missing required fields are rejected
    const parseResultMissing = schema?.safeParse({ title: "test" });
    expect(parseResultMissing?.success).toBe(false);

    // Note: By default, Zod objects allow additional properties
    // If you want to reject extra fields, use .strict() on the schema
    const parseResultWithExtra = schema?.safeParse({
      title: "test",
      learningOutcome: "test outcome",
      misconceptions: "extra field",
    });
    expect(parseResultWithExtra?.success).toBe(true); // Zod allows extra fields by default
  });

  it("should handle single lesson part", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "6",
      lessonParts: ["title"],
      subject: "English",
      title: "Poetry Analysis",
    };

    await generatePartialLessonPlanObject({
      parsedInput: { context },
    });

    const callArgs = mockGetLLMGeneration.mock.calls[0]?.[0];
    expect(callArgs).toBeDefined();
    expect(callArgs?.schema).toBeDefined();
  });

  it("should propagate errors from getLLMGeneration", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "9",
      lessonParts: ["title"],
      subject: "Geography",
      title: "Climate Change",
    };

    const error = new Error("AI service unavailable");
    mockGetLLMGeneration.mockRejectedValue(error);

    await expect(
      generatePartialLessonPlanObject({
        parsedInput: { context },
      }),
    ).rejects.toThrow("AI service unavailable");
  });

  it("should return the result from getLLMGeneration", async () => {
    const context: PartialLessonContextSchemaType = {
      year: "4",
      lessonParts: ["title", "learningOutcome"],
      subject: "Art",
      title: "Watercolour Painting",
    };

    const result = await generatePartialLessonPlanObject({
      parsedInput: { context },
    });

    expect(result).toEqual(mockLessonPlanResponse);
  });
});
