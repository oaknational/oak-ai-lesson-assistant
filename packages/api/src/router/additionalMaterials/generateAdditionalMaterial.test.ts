import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import { generateAdditionalMaterialObject } from "@oakai/additional-materials/src/documents/additionalMaterials/generateAdditionalMaterialObject";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { moderationResponseSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import type { z } from "zod";

import { generateAdditionalMaterial } from "./generateAdditionalMaterial";

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

// Mock fixture data
const mockGlossaryResult = {
  lessonTitle: "Test Lesson Title",
  glossary: [
    {
      term: "Mock Term 1",
      definition: "Mock definition for term 1",
    },
    {
      term: "Mock Term 2",
      definition: "Mock definition for term 2",
    },
  ],
};

const mockModerationResult = {
  justification: "Content is safe for educational use",
  scores: {
    l: 5,
    v: 5,
    u: 5,
    s: 5,
    p: 5,
    t: 5,
  },
  categories: [],
};

const mockPrismaInteraction = {
  id: "mock-interaction-id",
  userId: "test-user",
  config: {
    resourceType: "additional-glossary",
    resourceTypeVersion: 1,
  },
  output: mockGlossaryResult,
  outputModeration: mockModerationResult,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  additionalMaterialInteraction: {
    update: jest.fn(),
    create: jest.fn(),
  },
} as unknown as PrismaClientWithAccelerate;

const mockAuth: SignedInAuthObject = {
  userId: "test-user-id",
  user: { id: "test-user-id" },
  sessionClaims: {},
  sessionId: "session_123",
  actor: undefined,
  orgId: undefined,
  orgRole: undefined,
  orgSlug: undefined,
  orgPermissions: undefined,
  __experimental_factorVerificationAge: null,
  debug: () => ({}),
  getToken: jest.fn().mockResolvedValue("mock-token"),
  has: jest.fn().mockReturnValue(false),
} as unknown as SignedInAuthObject;

const mockRateLimit = {
  isSubjectToRateLimiting: true as const,
  limit: 100,
  remaining: 99,
  reset: Date.now() + 3600000,
};

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
    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
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
    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
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
    const toxicModerationResult: z.infer<typeof moderationResponseSchema> = {
      scores: {
        l: 2,
        v: 3,
        u: 2,
        s: 5,
        p: 5,
        t: 1,
      },
      justification: "Content contains inappropriate material",
      categories: ["t/encouragement-harmful-behaviour"],
    };

    mockGenerateAdditionalMaterialModeration.mockResolvedValueOnce(
      toxicModerationResult,
    );
    mockIsToxic.mockReturnValueOnce(true); // Mock isToxic to return true for this test

    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
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
      },
      auth: mockAuth,
      rateLimit: mockRateLimit,
    };

    const result = await generateAdditionalMaterial(params);

    expect(result.resource).toBeNull();
    expect(result.moderation).toEqual(toxicModerationResult);
    expect(result.resourceId).toBe("mock-interaction-id");
    expect(result.rateLimit).toEqual(mockRateLimit);
  });

  it("should include lessonId when provided in input", async () => {
    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
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
    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
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
    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: {
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
