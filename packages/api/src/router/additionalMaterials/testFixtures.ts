import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { SignedInAuthObject } from "@clerk/backend/internal";

// Shared mock data
export const mockGlossaryResult = {
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

export const mockModerationResult = {
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

export const mockToxicModerationResult: ModerationResult = {
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

export const mockPrismaInteraction = {
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

export const mockPrisma = {
  additionalMaterialInteraction: {
    update: jest.fn(),
    create: jest.fn(),
  },
} as unknown as PrismaClientWithAccelerate;

export const mockAuth: SignedInAuthObject = {
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

export const mockRateLimit = {
  isSubjectToRateLimiting: true as const,
  limit: 100,
  remaining: 99,
  reset: Date.now() + 3600000,
};
