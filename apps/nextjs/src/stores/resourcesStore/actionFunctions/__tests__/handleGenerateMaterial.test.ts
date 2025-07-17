import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";

import { handleStoreError } from "../../utils/errorHandling";
import { handleGenerateMaterial } from "../handleGenerateMaterial";

jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock("../../utils/errorHandling", () => ({ handleStoreError: jest.fn() }));

const mockSet = jest.fn();

const baseLessonPlan = {
  title: "Lesson Title",
  subject: "Math",
  keyStage: "KS2",
  lessonId: "lesson-123",
};

describe("handleGenerateMaterial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls mutateAsync and sets generation on success", async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({
      resource: { foo: "bar" },
      moderation: { flagged: false },
    });
    const mockGet = jest.fn(() => ({
      actions: {
        setGeneration: jest.fn(),
        setIsResourcesLoading: jest.fn(),
        analytics: { trackMaterialRefined: jest.fn() },
      },
      docType: "additional-glossary",
      pageData: { lessonPlan: baseLessonPlan },
      formState: { year: "2024" },
      id: "resource-1",
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleGenerateMaterial(mockSet, mockGet);
    await handler({ mutateAsync: mockMutateAsync });
    expect(mockMutateAsync).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({
      generation: { foo: "bar" },
      moderation: { flagged: false },
      refinementGenerationHistory: [],
    });
  });

  it("throws if docType is missing", async () => {
    const mockGet = jest.fn(() => ({
      actions: {
        setGeneration: jest.fn(),
        setIsResourcesLoading: jest.fn(),
        analytics: { trackMaterialRefined: jest.fn() },
      },
      docType: null,
      pageData: { lessonPlan: baseLessonPlan },
      formState: { year: "2024" },
      id: "resource-1",
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleGenerateMaterial(mockSet, mockGet);
    await expect(handler({ mutateAsync: jest.fn() })).rejects.toThrow(
      "Expected 'additional-comprehension' | 'additional-glossary' | 'additional-starter-quiz' | 'additional-exit-quiz', received null",
    );
  });

  it("throws if lesson plan fields are missing", async () => {
    const mockGet = jest.fn(() => ({
      actions: {
        setGeneration: jest.fn(),
        setIsResourcesLoading: jest.fn(),
        analytics: { trackMaterialRefined: jest.fn() },
      },
      docType: "additional-glossary",
      pageData: { lessonPlan: { ...baseLessonPlan, title: null } },
      formState: { year: "2024" },
      id: "resource-1",
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleGenerateMaterial(mockSet, mockGet);
    await expect(handler({ mutateAsync: jest.fn() })).rejects.toThrow(
      "Lesson plan is missing required fields (title, subject, or keyStage)",
    );
  });

  it("calls handleStoreError on mutateAsync error", async () => {
    const error = new Error("fail");
    const mockMutateAsync = jest.fn().mockRejectedValue(error);
    const mockGet = jest.fn(() => ({
      actions: {
        setGeneration: jest.fn(),
        setIsResourcesLoading: jest.fn(),
        analytics: { trackMaterialRefined: jest.fn() },
      },
      docType: "additional-glossary",
      pageData: { lessonPlan: baseLessonPlan },
      formState: { year: "2024" },
      id: "resource-1",
    }));
    // @ts-expect-error Only analytics is mocked, not the full actions shape
    const handler = handleGenerateMaterial(mockSet, mockGet);
    await handler({ mutateAsync: mockMutateAsync });
    expect(handleStoreError).toHaveBeenCalledWith(
      mockSet,
      error,
      expect.objectContaining({ context: "handleGenerateMaterial" }),
    );
  });
});
