import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { generateTeachingMaterialModeration } from "@oakai/teaching-materials";
import { generateTeachingMaterialObject } from "@oakai/teaching-materials/src/documents/teachingMaterials/generateTeachingMaterialObject";

import {
  type GenerateTeachingMaterialParams,
  generateTeachingMaterial,
} from "./generateTeachingMaterial";
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
const mockGenerateTeachingMaterialObject =
  generateTeachingMaterialObject as jest.MockedFunction<
    typeof generateTeachingMaterialObject
  >;
const mockGenerateTeachingMaterialModeration =
  generateTeachingMaterialModeration as jest.MockedFunction<
    typeof generateTeachingMaterialModeration
  >;
const mockIsToxic = isToxic as jest.MockedFunction<typeof isToxic>;

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock(
  "@oakai/additional-materials/src/documents/teachingMaterials/generateTeachingMaterialObject",
  () => ({
    generateTeachingMaterialObject: jest.fn(),
  }),
);
jest.mock("@oakai/additional-materials", () => ({
  generateTeachingMaterialModeration: jest.fn(),
}));
jest.mock("@oakai/core/src/utils/ailaModeration/helpers", () => ({
  isToxic: jest.fn(),
}));
jest.mock("./safetyUtils", () => ({
  recordSafetyViolation: jest.fn(),
}));
jest.mock(
  "@oakai/additional-materials/src/documents/teachingMaterials/configSchema",
  () => ({
    teachingMaterialsConfigMap: {
      "additional-glossary": {
        version: 1,
      },
    },
  }),
);

describe("generateTeachingMaterial", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock return values
    mockGenerateTeachingMaterialObject.mockResolvedValue(mockGlossaryResult);
    mockGenerateTeachingMaterialModeration.mockResolvedValue(
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
    const params: GenerateTeachingMaterialParams = {
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

    const result = await generateTeachingMaterial(params);

    expect(mockPrisma.additionalMaterialInteraction.create).toHaveBeenCalled();
    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should log and call prisma.update when resourceId is provided", async () => {
    const params: GenerateTeachingMaterialParams = {
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

    const result = await generateTeachingMaterial(params);

    expect(mockPrisma.additionalMaterialInteraction.update).toHaveBeenCalled();
    expect(result.resource).toEqual(mockGlossaryResult);
    expect(result.moderation).toEqual(mockModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should handle toxic moderation results", async () => {
    mockGenerateTeachingMaterialModeration.mockResolvedValueOnce(
      mockToxicModerationResult,
    );
    mockIsToxic.mockReturnValueOnce(true); // Mock isToxic to return true for this test

    const params: GenerateTeachingMaterialParams = {
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

    const result = await generateTeachingMaterial(params);

    expect(result.resource).toBeNull();
    expect(result.moderation).toEqual(mockToxicModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should include lessonId when provided in input", async () => {
    const params: GenerateTeachingMaterialParams = {
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

    const result = await generateTeachingMaterial(params);

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
    const params: GenerateTeachingMaterialParams = {
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

    const result = await generateTeachingMaterial(params);

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
    const params: GenerateTeachingMaterialParams = {
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

    const result = await generateTeachingMaterial(params);

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
