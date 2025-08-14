import { generateAdditionalMaterialModeration } from "@oakai/additional-materials";
import { generatePartialLessonPlanObject } from "@oakai/additional-materials/src/documents/partialLessonPlan/generateLessonPlan";
import type { PartialLessonContextSchemaType } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import { performLakeraThreatCheck } from "@oakai/additional-materials/src/threatDetection/lakeraThreatCheck";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { SignedInAuthObject } from "@clerk/backend/internal";

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
    l1: 5, l2: 5,
    u1: 5, u2: 5, u3: 5, u4: 5, u5: 5,
    s1: 5,
    p2: 5, p3: 5, p4: 5, p5: 5,
    e1: 5,
    r1: 5, r2: 5,
    n1: 5, n2: 5, n3: 5, n4: 5, n5: 5, n6: 5, n7: 5,
    t1: 5, t2: 5, t3: 5, t4: 5, t5: 5, t6: 5,
  },
  categories: [],
};
const mockToxicModerationResult: ModerationResult = {
  scores: {
    l1: 2, l2: 5,
    u1: 2, u2: 3, u3: 5, u4: 5, u5: 5,
    s1: 5,
    p2: 5, p3: 5, p4: 5, p5: 5,
    e1: 5,
    r1: 5, r2: 5,
    n1: 5, n2: 5, n3: 5, n4: 5, n5: 5, n6: 5, n7: 5,
    t1: 5, t2: 1, t3: 5, t4: 5, t5: 5, t6: 5,
  },
  justification: JSON.stringify({"l1": "Contains discriminatory language", "u1": "Contains sensitive content", "u2": "Contains moderate violence", "t2": "Encourages harmful behavior"}),
  categories: ["l1", "u1", "u2", "t2"],
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
  "@oakai/additional-materials/src/documents/partialLessonPlan/generateLessonPlan",
  () => ({
    generatePartialLessonPlanObject: jest.fn(),
  }),
);

jest.mock("@oakai/additional-materials", () => ({
  generateAdditionalMaterialModeration: jest.fn(),
}));

jest.mock(
  "@oakai/additional-materials/src/threatDetection/lakeraThreatCheck",
  () => ({
    performLakeraThreatCheck: jest.fn(),
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
const mockGenerateAdditionalMaterialModeration =
  generateAdditionalMaterialModeration as jest.MockedFunction<
    typeof generateAdditionalMaterialModeration
  >;
const mockPerformLakeraThreatCheck =
  performLakeraThreatCheck as jest.MockedFunction<
    typeof performLakeraThreatCheck
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
    mockGenerateAdditionalMaterialModeration.mockResolvedValue(
      mockModerationResult,
    );
    mockIsToxic.mockReturnValue(false);
    mockPerformLakeraThreatCheck.mockResolvedValue({
      flagged: false,
      metadata: { request_uuid: "123" },
      payload: [],
      breakdown: [
        {
          project_id: "proj-1",
          policy_id: "policy-1",
          detector_id: "detector-1",
          detector_type: "type-1",
          detected: true,
          message_id: 1,
        },
      ],
    });
    mockGetMockModerationResult.mockReturnValue(null);

    // Reset Prisma mocks
    (
      mockPrisma.additionalMaterialInteraction.create as jest.MockedFunction<
        typeof mockPrisma.additionalMaterialInteraction.create
      >
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
          metadata: {
            flagged: false,
            metadata: { request_uuid: "123" },
            payload: [],
            breakdown: [
              {
                project_id: "proj-1",
                policy_id: "policy-1",
                detector_id: "detector-1",
                detector_type: "type-1",
                detected: true,
                message_id: 1,
              },
            ],
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
    mockGenerateAdditionalMaterialModeration.mockResolvedValueOnce(
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
    const threatResult: {
      payload: unknown[];
      metadata: {
        request_uuid: string;
      };
      flagged: boolean;
      breakdown: {
        project_id: string;
        policy_id: string;
        detector_id: string;
        detector_type: string;
        detected: boolean;
        message_id: number;
      }[];
    } = {
      flagged: true,
      metadata: { request_uuid: "123" },
      payload: [],
      breakdown: [
        {
          project_id: "proj-1",
          policy_id: "policy-1",
          detector_id: "detector-1",
          detector_type: "type-1",
          detected: true,
          message_id: 1,
        },
      ],
    };

    mockPerformLakeraThreatCheck.mockResolvedValueOnce(threatResult);

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
      moderation: mockModerationResult,
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
          metadata: threatResult,
        },
      },
    });
  });

  it("should use mock moderation result when available", async () => {
    const mockSensitiveResult: ModerationResult = {
      justification: "Content contains sensitive topics",
      scores: {
        l1: 3, l2: 5,
        u1: 3, u2: 3, u3: 5, u4: 5, u5: 5,
        s1: 3,
        p2: 3, p3: 5, p4: 5, p5: 5,
        e1: 5,
        r1: 5, r2: 5,
        n1: 5, n2: 5, n3: 5, n4: 5, n5: 5, n6: 5, n7: 5,
        t1: 3, t2: 5, t3: 5, t4: 5, t5: 5, t6: 5,
      },
      categories: ["l1", "u1", "u2", "s1", "p2", "t1"],
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
