import type { moderationResponseSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import type { z } from "zod";

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
    l: 5,
    v: 5,
    u: 5,
    s: 5,
    p: 5,
    t: 5,
  },
  categories: [],
};

export const mockToxicModerationResult: z.infer<
  typeof moderationResponseSchema
> = {
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

export const mockPrismaInteraction = {
  id: "mock-interaction-id",
  userId: "test-user",
  config: {
    materialType: "additional-glossary",
    materialTypeVersion: 1,
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
