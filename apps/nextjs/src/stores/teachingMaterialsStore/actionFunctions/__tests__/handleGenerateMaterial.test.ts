import type { TrpcUtils } from "@/utils/trpc";

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
  let mockTrpc: TrpcUtils;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create trpc mock
    mockTrpc = {
      client: {
        additionalMaterials: {
          generateAdditionalMaterial: {
            mutate: jest.fn().mockResolvedValue({
              resource: { foo: "bar" },
              moderation: { flagged: false },
            }),
          },
        },
      },
    } as unknown as TrpcUtils;
  });

  it("calls mutate and sets generation on success", async () => {
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
    const handler = handleGenerateMaterial(mockSet, mockGet, mockTrpc);
    await handler();
    expect(
      mockTrpc.client.additionalMaterials.generateAdditionalMaterial.mutate,
    ).toHaveBeenCalled();
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
    const handler = handleGenerateMaterial(mockSet, mockGet, mockTrpc);
    await expect(handler()).rejects.toThrow(
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
    const handler = handleGenerateMaterial(mockSet, mockGet, mockTrpc);
    await expect(handler()).rejects.toThrow(
      "Lesson plan is missing required fields (title, subject, or keyStage)",
    );
  });

  it("calls handleStoreError on mutate error", async () => {
    const error = new Error("fail");
    (
      mockTrpc.client.additionalMaterials.generateAdditionalMaterial
        .mutate as jest.Mock
    ).mockRejectedValue(error);
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
    const handler = handleGenerateMaterial(mockSet, mockGet, mockTrpc);
    await handler();
    expect(handleStoreError).toHaveBeenCalledWith(
      mockSet,
      error,
      expect.objectContaining({ context: "handleGenerateMaterial" }),
    );
  });
});
