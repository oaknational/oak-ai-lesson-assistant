import { clerkClient } from "@clerk/nextjs/server";

import { adminRouter } from "./admin";

const byUserId = jest.fn();
const markFalsePositive = jest.fn();

jest.mock("@oakai/core", () => ({
  Moderations: jest.fn(),
  SafetyViolations: jest.fn(),
  ThreatDetections: class {
    byUserId = byUserId;
    markFalsePositive = markFalsePositive;
  },
}));

jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: jest.fn(),
}));

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

describe("adminRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    byUserId.mockReset();
    markFalsePositive.mockReset();

    (clerkClient as jest.Mock).mockResolvedValue({
      users: {
        getUser: jest.fn().mockResolvedValue({
          emailAddresses: [
            {
              emailAddress: "admin@thenational.academy",
              verification: { status: "verified" },
            },
          ],
        }),
      },
    });
  });

  it("returns threat detections and all safety violations including threat-linked ones", async () => {
    byUserId.mockResolvedValue([
      {
        id: "threat-1",
        safetyViolationId: "safety-threat-1",
        safetyViolation: null,
      },
    ]);

    const caller = adminRouter.createCaller({
      auth: { userId: "admin-user" },
      prisma: {
        safetyViolation: {
          findMany: jest
            .fn()
            .mockResolvedValue([
              { id: "safety-threat-1" },
              { id: "safety-other-1" },
            ]),
        },
      },
      req: { url: "http://localhost/admin" },
    } as never);

    const result = await caller.getUserSafetyReview({ userId: "user-123" });

    expect(byUserId).toHaveBeenCalledWith("user-123");
    expect(result).toEqual(
      expect.objectContaining({
        maxAllowedSafetyViolations: expect.any(Number),
        threatDetections: [
          {
            id: "threat-1",
            safetyViolationId: "safety-threat-1",
            safetyViolation: null,
          },
        ],
        safetyViolations: [{ id: "safety-threat-1" }, { id: "safety-other-1" }],
      }),
    );
  });

  it("marks a threat detection as a false positive", async () => {
    markFalsePositive.mockResolvedValue(undefined);

    const caller = adminRouter.createCaller({
      auth: { userId: "admin-user" },
      prisma: {},
      req: { url: "http://localhost/admin" },
    } as never);

    await caller.markThreatDetectionFalsePositive({
      threatDetectionId: "threat-123",
    });

    expect(markFalsePositive).toHaveBeenCalledWith("threat-123");
  });

  it.each([
    ["unverified", { status: "unverified" }],
    ["expired", { status: "expired" }],
    ["missing", null],
  ])(
    "rejects a user whose Oak email verification is %s",
    async (_label, verification) => {
      (clerkClient as jest.Mock).mockResolvedValue({
        users: {
          getUser: jest.fn().mockResolvedValue({
            emailAddresses: [
              {
                emailAddress: "teacher@example.com",
                verification: { status: "verified" },
              },
              { emailAddress: "someone@thenational.academy", verification },
            ],
          }),
        },
      });

      const caller = adminRouter.createCaller({
        auth: { userId: "teacher-user" },
        prisma: {},
        req: { url: "http://localhost/admin" },
      } as never);

      await expect(
        caller.markThreatDetectionFalsePositive({
          threatDetectionId: "threat-123",
        }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(markFalsePositive).not.toHaveBeenCalled();
    },
  );
});
