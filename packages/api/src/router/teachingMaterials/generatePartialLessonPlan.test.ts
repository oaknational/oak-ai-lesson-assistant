import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type {
  ModerationResult,
  moderationResponseSchema,
} from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { generateTeachingMaterialModeration } from "@oakai/teaching-materials";
import { generatePartialLessonPlanObject } from "@oakai/teaching-materials/src/documents/partialLessonPlan/generateLessonPlan";
import type { PartialLessonContextSchemaType } from "@oakai/teaching-materials/src/documents/partialLessonPlan/schema";
import { performThreatCheck } from "@oakai/teaching-materials/src/threatDetection/performThreatCheck";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import type { z } from "zod";

import { generatePartialLessonPlan } from "./generatePartialLessonPlan";
import { getMockModerationResult } from "./moderationFixtures";
import { recordSafetyViolation } from "./safetyUtils";

// Mock fixture data
const mockLessonPlan = {
  title: "Test Lesson Plan",
  topic: "topic",
  subject: "Mathematics",
  keyStage: "key-stage-2",
  learningOutcome: "Students will understand basic arithmetic",
  learningCycles:
    "1. Introduction to addition\n2. Practice with simple addition problems\n3. Group activity to reinforce learning",
  priorKnowledge: ["Basic number recognition"],
  keyLearningPoints: ["Addition is combining numbers"],
  misconceptions: [
    {
      misconception: "Students might think subtraction is the same as addition",
      description: "Clarify the difference between combining and taking away",
    },
  ],
  keywords: [
    { keyword: "Addition", definition: "Combining two or more numbers" },
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
const mockToxicModerationResult: z.infer<typeof moderationResponseSchema> = {
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

const mockPrismaInteraction = {
  id: "mock-interaction-id",
  userId: "test-user",
  inputText: "Mathematics - Test Lesson",
  config: {
    resourceType: "partial-lesson-plan",
    resourceTypeVersion: 1,
  },
  output: mockLessonPlan,
  outputModeration: mockModerationResult,
  inputThreatDetection: {
    flagged: false,
    metadata: {},
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  derivedFromId: null,
  adaptsOutputId: null,
};

const mockInput: PartialLessonContextSchemaType = {
  title: "Test Lesson",
  subject: "Mathematics",
  year: "Year 3",
  lessonParts: ["title", "learningOutcome", "learningCycles"],
};

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock(
  "@oakai/teaching-materials/src/documents/partialLessonPlan/generateLessonPlan",
  () => ({
    generatePartialLessonPlanObject: jest.fn(),
  }),
);

jest.mock("@oakai/teaching-materials", () => ({
  generateTeachingMaterialModeration: jest.fn(),
}));

jest.mock(
  "@oakai/teaching-materials/src/threatDetection/performThreatCheck",
  () => ({
    performThreatCheck: jest.fn(),
  }),
);

jest.mock("@oakai/core/src/utils/ailaModeration/helpers", () => ({
  isToxic: jest.fn(),
}));

jest.mock("./moderationFixtures", () => ({
  getMockModerationResult: jest.fn(),
}));

jest.mock("./safetyUtils", () => ({
  recordSafetyViolation: jest.fn(),
}));

const mockPrisma = {
  additionalMaterialInteraction: {
    create: jest.fn().mockResolvedValue(mockPrismaInteraction),
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

// Cast the mocked functions
const mockGeneratePartialLessonPlanObject =
  generatePartialLessonPlanObject as jest.MockedFunction<
    typeof generatePartialLessonPlanObject
  >;
const mockGenerateTeachingMaterialModeration =
  generateTeachingMaterialModeration as jest.MockedFunction<
    typeof generateTeachingMaterialModeration
  >;
const mockPerformThreatCheck = performThreatCheck as jest.MockedFunction<
  typeof performThreatCheck
>;
const mockIsToxic = isToxic as jest.MockedFunction<typeof isToxic>;
const mockGetMockModerationResult =
  getMockModerationResult as jest.MockedFunction<
    typeof getMockModerationResult
  >;
const mockRecordSafetyViolation = recordSafetyViolation as jest.MockedFunction<
  typeof recordSafetyViolation
>;

describe("generatePartialLessonPlan", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock return values
    mockGeneratePartialLessonPlanObject.mockResolvedValue(mockLessonPlan);
    mockGenerateTeachingMaterialModeration.mockResolvedValue(
      mockModerationResult,
    );
    mockIsToxic.mockReturnValue(false);
    mockPerformThreatCheck.mockResolvedValue({
      provider: "model_armor",
      isThreat: false,
      message: "No threats detected",
      findings: [],
      rawResponse: {
        sanitizationResult: {
          filterMatchState: "NO_MATCH_FOUND",
          filterResults: {},
        },
      },
    });
    mockGetMockModerationResult.mockReturnValue(null);

    // Reset Prisma mocks
    (
      mockPrisma.additionalMaterialInteraction.create as jest.Mock
    ).mockResolvedValue(mockPrismaInteraction);
  });

  it("should successfully generate a partial lesson plan", async () => {
    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: mockInput,
      auth: mockAuth,
    };

    const result = await generatePartialLessonPlan(params);

    expect(result.threatDetection).toBe(false);
    expect(result.lesson).toEqual(mockLessonPlan);
    expect(result.lessonId).toBe("mock-interaction-id");
    expect(result.moderation).toEqual(mockModerationResult);

    expect(
      mockPrisma.additionalMaterialInteraction.create,
    ).toHaveBeenCalledWith({
      data: {
        userId: "test-user",
        inputText: "Mathematics - Test Lesson",
        config: {
          resourceType: "partial-lesson-plan",
          resourceTypeVersion: 1,
        },
        output: mockLessonPlan,
        outputModeration: mockModerationResult,
        inputThreatDetection: {
          flagged: false,
          provider: "model_armor",
          metadata: {
            sanitizationResult: {
              filterMatchState: "NO_MATCH_FOUND",
              filterResults: {},
            },
          },
        },
      },
    });
  });

  it("should throw error when lesson generation fails", async () => {
    mockGeneratePartialLessonPlanObject.mockRejectedValueOnce(
      new Error("Failed to generate lesson plan"),
    );

    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: mockInput,
      auth: mockAuth,
    };

    await expect(generatePartialLessonPlan(params)).rejects.toThrow(
      "Failed to generate lesson plan",
    );
  });

  it("should handle toxic moderation results and return null lesson", async () => {
    mockGenerateTeachingMaterialModeration.mockResolvedValueOnce(
      mockToxicModerationResult,
    );
    mockIsToxic.mockReturnValueOnce(true);

    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: mockInput,
      auth: mockAuth,
    };

    const result = await generatePartialLessonPlan(params);

    expect(result.threatDetection).toBe(false);
    expect(result.lesson).toBeNull();
    expect(result.lessonId).toBe("mock-interaction-id");
    expect(result.moderation).toEqual(mockToxicModerationResult);

    expect(mockRecordSafetyViolation).toHaveBeenCalledWith({
      prisma: mockPrisma,
      auth: mockAuth,
      interactionId: "mock-interaction-id",
      violationType: "MODERATION",
      userAction: "PARTIAL_LESSON_GENERATION",
      moderation: mockToxicModerationResult,
    });
  });

  it("should handle mock toxic moderation results", async () => {
    mockGetMockModerationResult.mockReturnValueOnce(mockToxicModerationResult);
    mockIsToxic.mockReturnValueOnce(true);

    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: { ...mockInput, title: "Test Lesson mod:tox" },
      auth: mockAuth,
    };

    const result = await generatePartialLessonPlan(params);

    expect(result.threatDetection).toBe(false);
    expect(result.lesson).toBeNull();
    expect(result.lessonId).toBe("mock-interaction-id");
    expect(result.moderation).toEqual(mockToxicModerationResult);

    expect(mockRecordSafetyViolation).toHaveBeenCalledWith({
      prisma: mockPrisma,
      auth: mockAuth,
      interactionId: "mock-interaction-id",
      violationType: "MODERATION",
      userAction: "PARTIAL_LESSON_GENERATION",
      moderation: mockToxicModerationResult,
    });
  });

  it("should handle threat detection and return null lesson", async () => {
    const threatResult: ThreatDetectionResult = {
      provider: "model_armor",
      isThreat: true,
      severity: "critical",
      category: "prompt_injection",
      message: "Potential threat detected",
      findings: [
        {
          category: "prompt_injection",
          severity: "critical",
          providerCode: "pi_and_jailbreak",
          detected: true,
        },
      ],
      rawResponse: {
        sanitizationResult: {
          filterMatchState: "MATCH_FOUND",
          filterResults: {},
        },
      },
    };

    mockPerformThreatCheck.mockResolvedValueOnce(threatResult);

    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: mockInput,
      auth: mockAuth,
    };

    const result = await generatePartialLessonPlan(params);

    expect(result.threatDetection).toBe(true);
    expect(result.lesson).toBeNull();
    expect(result.lessonId).toBe("mock-interaction-id");
    expect(result.moderation).toEqual(mockModerationResult);

    expect(mockRecordSafetyViolation).toHaveBeenCalledWith({
      prisma: mockPrisma,
      auth: mockAuth,
      interactionId: "mock-interaction-id",
      violationType: "THREAT",
      userAction: "PARTIAL_LESSON_GENERATION",
      messages: [
        {
          role: "user",
          content: "Mathematics - Test Lesson",
        },
      ],
      threatDetection: threatResult,
    });

    expect(
      mockPrisma.additionalMaterialInteraction.create,
    ).toHaveBeenCalledWith({
      data: {
        userId: "test-user",
        inputText: "Mathematics - Test Lesson",
        config: {
          resourceType: "partial-lesson-plan",
          resourceTypeVersion: 1,
        },
        output: mockLessonPlan,
        outputModeration: mockModerationResult,
        inputThreatDetection: {
          flagged: true,
          provider: "model_armor",
          metadata: threatResult.rawResponse,
        },
      },
    });
  });

  it("should use mock moderation result when available", async () => {
    const mockSensitiveResult: ModerationResult = {
      justification: "Content contains sensitive topics",
      scores: { l: 3, v: 3, u: 3, s: 3, p: 3, t: 3 },
      categories: ["u/sensitive-content"],
    };

    mockGetMockModerationResult.mockReturnValueOnce(mockSensitiveResult);

    const params = {
      prisma: mockPrisma,
      userId: "test-user",
      input: { ...mockInput, title: "Test Lesson mod:sen" },
      auth: mockAuth,
    };

    const result = await generatePartialLessonPlan(params);

    expect(result.threatDetection).toBe(false);
    expect(result.lesson).toEqual(mockLessonPlan);
    expect(result.lessonId).toBe("mock-interaction-id");
    expect(result.moderation).toEqual(mockSensitiveResult);
  });
});
