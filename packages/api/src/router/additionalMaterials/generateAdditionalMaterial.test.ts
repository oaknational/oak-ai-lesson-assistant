import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";

import {
  type GenerateAdditionalMaterialParams,
  generateAdditionalMaterial,
} from "./generateAdditionalMaterial";
import {
  mockAuth,
  mockGlossaryResult,
  mockModerationResult,
  mockPrisma,
  mockPrismaInteraction,
  mockRateLimit,
  mockToxicModerationResult,
} from "./testFixtures";

// Cast the mocked functions
const mockGenerateAdditionalMaterialObject =
  generateAdditionalMaterialObject as jest.MockedFunction<
    typeof generateAdditionalMaterialObject
  >;
const mockGenerateAdditionalMaterialModeration =
  generateAdditionalMaterialModeration as jest.MockedFunction<
    typeof generateAdditionalMaterialModeration
  >;
const mockIsToxic = isToxic as jest.MockedFunction<typeof isToxic>;

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock(
  "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject",
  () => ({
    generateAdditionalMaterialObject: jest.fn(),
  }),
);
jest.mock("@oakai/additional-materials", () => ({
  generateAdditionalMaterialModeration: jest.fn(),
}));
jest.mock("@oakai/core/src/utils/ailaModeration/helpers", () => ({
  isToxic: jest.fn(),
}));
jest.mock("./safetyUtils", () => ({
  recordSafetyViolation: jest.fn(),
}));
jest.mock(
  "@oakai/additional-materials/src/documents/additionalMaterials/configSchema",
  () => ({
    additionalMaterialsConfigMap: {
      "additional-glossary": {
        version: 1,
      },
    },
  }),
);

describe("generateAdditionalMaterial", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock return values
    mockGenerateAdditionalMaterialObject.mockResolvedValue(mockGlossaryResult);
    mockGenerateAdditionalMaterialModeration.mockResolvedValue(
      mockModerationResult,
    );
    mockIsToxic.mockReturnValue(false); // Default to non-toxic

    // Reset Prisma mocks to return the expected values
    (
      mockPrisma.additionalMaterialInteraction.create as jest.Mock
    ).mockResolvedValue(mockPrismaInteraction);
    (
      mockPrisma.additionalMaterialInteraction.update as jest.Mock
    ).mockResolvedValue(mockPrismaInteraction);
  });

  it("should log and call prisma.create when resourceId is not provided", async () => {
    const params: GenerateAdditionalMaterialParams = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
        documentType: "additional-glossary" as const,
        source: "aila",
        context: {
          lessonPlan: {
            title: "Test Lesson",
            topic: "Students will learn about mock terms",
            keyStage: "ks3",
            subject: "english",
          },
          refinement: [{ type: "custom" as const, payload: "test-refinement" }],
        },
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(mockPrisma.additionalMaterialInteraction.create).toHaveBeenCalled();
    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should log and call prisma.update when resourceId is provided", async () => {
    const params: GenerateAdditionalMaterialParams = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
        documentType: "additional-glossary" as const,
        source: "aila",
        context: {
          lessonPlan: {
            title: "Test Lesson",
            topic: "Students will learn about mock terms",
            keyStage: "ks3",
            subject: "english",
          },
          refinement: [{ type: "custom" as const, payload: "test-refinement" }],
        },
        resourceId: "existing-resource",
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(mockPrisma.additionalMaterialInteraction.update).toHaveBeenCalled();
    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should handle toxic moderation results", async () => {
    mockGenerateAdditionalMaterialModeration.mockResolvedValueOnce(
      mockToxicModerationResult,
    );
    mockIsToxic.mockReturnValueOnce(true); // Mock isToxic to return true for this test

    const params: GenerateAdditionalMaterialParams = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
        documentType: "additional-glossary" as const,
        source: "aila",
        context: {
          lessonPlan: {
            title: "Test Lesson",
            topic: "Students will learn about mock terms",
            keyStage: "ks3",
            subject: "english",
          },
          refinement: [{ type: "custom" as const, payload: "test-refinement" }],
        },
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(result.resource).toBeNull();
    expect(result.moderation).toEqual(mockToxicModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should include lessonId when provided in input", async () => {
    const params: GenerateAdditionalMaterialParams = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
        documentType: "additional-glossary" as const,
        source: "aila",
        context: {
          lessonPlan: {
            title: "Test Lesson",
            topic: "Students will learn about mock terms",
            keyStage: "ks3",
            subject: "english",
          },
          refinement: [{ type: "custom" as const, payload: "test-refinement" }],
        },
        lessonId: "test-lesson-id",
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(
      mockPrisma.additionalMaterialInteraction.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          derivedFromId: "test-lesson-id",
        }),
      }),
    );

    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should include adaptsOutputId when provided in input", async () => {
    const params: GenerateAdditionalMaterialParams = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
        documentType: "additional-glossary" as const,
        source: "aila",
        context: {
          lessonPlan: {
            title: "Test Lesson",
            topic: "Students will learn about mock terms",
            keyStage: "ks3",
            subject: "english",
          },
          refinement: [{ type: "custom" as const, payload: "test-refinement" }],
        },
        adaptsOutputId: "test-adapts-id",
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(
      mockPrisma.additionalMaterialInteraction.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          adaptsOutputId: "test-adapts-id",
        }),
      }),
    );

    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should handle null adaptsOutputId", async () => {
    const params: GenerateAdditionalMaterialParams = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
        source: "aila",
        documentType: "additional-glossary" as const,
        context: {
          lessonPlan: {
            title: "Test Lesson",
            topic: "Students will learn about mock terms",
            keyStage: "ks3",
            subject: "english",
          },
          refinement: [{ type: "custom" as const, payload: "test-refinement" }],
        },
        adaptsOutputId: null,
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(
      mockPrisma.additionalMaterialInteraction.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          adaptsOutputId: null,
        }),
      }),
    );

    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });
});
