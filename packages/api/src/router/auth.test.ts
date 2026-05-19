import { demoUsers } from "@oakai/core";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";

import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/node";

import { authRouter } from "./auth";

jest.mock("@oakai/core", () => ({
  demoUsers: {
    isDemoStatusSet: jest.fn(),
    getUserRegion: jest.fn(),
  },
}));

jest.mock("@oakai/core/src/analytics/hubspotClient", () => ({
  createHubspotCustomer: jest.fn(),
}));

jest.mock("@oakai/core/src/analytics/posthogAiBetaServerClient", () => ({
  posthogAiBetaServerClient: {
    identifyImmediate: jest.fn(),
  },
}));

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: jest.fn(),
}));

jest.mock("@clerk/shared", () => ({
  isClerkAPIResponseError: jest.fn((error: unknown) => {
    return (
      typeof error === "object" &&
      error !== null &&
      "isClerkApiResponseError" in error
    );
  }),
}));

jest.mock("@sentry/node", () => ({
  captureException: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  trpcMiddleware: jest.fn(
    () =>
      ({ next }: { next: () => unknown }) =>
        next(),
  ),
}));

jest.mock("../middleware/auth", () => {
  const { publicProcedure } = jest.requireActual("../trpc");

  return {
    protectedProcedure: publicProcedure,
  };
});

const mockedDemoUsers = jest.mocked(demoUsers);
const mockedClerkClient = jest.mocked(clerkClient);
const mockedPosthogClient = jest.mocked(posthogAiBetaServerClient);
const mockedAiLogger = jest.mocked(aiLogger);
const authLoggerIndex = mockedAiLogger.mock.calls.findIndex(
  ([loggerName]) => loggerName === "auth",
);
const authLogger = mockedAiLogger.mock.results[authLoggerIndex]?.value as {
  error: jest.Mock;
};
const authLoggerError = authLogger.error;

const createCaller = () =>
  authRouter.createCaller({
    auth: { userId: "user_123" },
    prisma: {},
    req: {
      url: "https://example.com/api/trpc/main/auth.setDemoStatus",
      headers: new Headers({ "cf-ipcountry": "GB" }),
    },
  } as never);

describe("authRouter.setDemoStatus", () => {
  const getUser = jest.fn();
  const updateUserMetadata = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedClerkClient.mockResolvedValue({
      users: {
        getUser,
        updateUserMetadata,
      },
    } as never);

    getUser.mockResolvedValue({
      publicMetadata: {
        labs: {
          isDemoUser: true,
        },
      },
      privateMetadata: {},
      emailAddresses: [],
    });
    updateUserMetadata.mockResolvedValue(undefined);
    mockedDemoUsers.isDemoStatusSet.mockReturnValue(true);
    mockedDemoUsers.getUserRegion.mockResolvedValue({
      region: "GB",
      isDemoRegion: false,
    });
    mockedPosthogClient.identifyImmediate.mockResolvedValue(undefined);
  });

  it("returns a boolean when demo status is already set", async () => {
    const result = await createCaller().setDemoStatus();

    expect(result).toEqual({ isDemoUser: true });
    expect(updateUserMetadata).not.toHaveBeenCalled();
    expect(mockedPosthogClient.identifyImmediate).not.toHaveBeenCalled();
  });

  it("sets demo metadata and identifies the user when demo status is missing", async () => {
    mockedDemoUsers.isDemoStatusSet.mockReturnValue(false);

    const result = await createCaller().setDemoStatus();

    expect(mockedDemoUsers.getUserRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        publicMetadata: {
          labs: {
            isDemoUser: true,
          },
        },
      }),
      "GB",
    );
    expect(updateUserMetadata).toHaveBeenCalledWith("user_123", {
      publicMetadata: {
        labs: {
          isDemoUser: false,
        },
      },
      privateMetadata: {
        region: "GB",
      },
    });
    expect(mockedPosthogClient.identifyImmediate).toHaveBeenCalledWith({
      distinctId: "user_123",
      properties: {
        isDemoUser: false,
      },
    });
    expect(result).toEqual({ isDemoUser: false });
  });

  it("records Clerk diagnostics and rethrows when getUser fails", async () => {
    const clerkError = Object.assign(new Error("Clerk unavailable"), {
      name: "ClerkAPIResponseError",
      isClerkApiResponseError: true,
      status: 503,
      clerkTraceId: "trace_123",
      retryAfter: 60,
      errors: [
        { code: "unexpected_error", message: "Service unavailable" },
        { code: "extra_1", message: "Extra one" },
        { code: "extra_2", message: "Extra two" },
        { code: "extra_3", message: "Extra three" },
      ],
    });
    getUser.mockRejectedValue(clerkError);

    await expect(createCaller().setDemoStatus()).rejects.toMatchObject({
      cause: clerkError,
    });

    expect(Sentry.setTag).toHaveBeenCalledWith(
      "procedure",
      "auth.setDemoStatus",
    );
    expect(Sentry.setTag).toHaveBeenCalledWith(
      "clerk.operation",
      "users.getUser",
    );
    expect(Sentry.setTag).toHaveBeenCalledWith("clerk.status", "503");
    expect(Sentry.setContext).toHaveBeenCalledWith("clerk", {
      procedure: "auth.setDemoStatus",
      clerkOperation: "users.getUser",
      userId: "user_123",
      requestUrl: "https://example.com/api/trpc/main/auth.setDemoStatus",
      cfIpCountry: "GB",
      errorName: "ClerkAPIResponseError",
      errorMessage: "Clerk unavailable",
      status: 503,
      clerkTraceId: "trace_123",
      retryAfter: 60,
      clerkErrors: [
        { code: "unexpected_error", message: "Service unavailable" },
        { code: "extra_1", message: "Extra one" },
        { code: "extra_2", message: "Extra two" },
      ],
    });
    expect(authLoggerError).toHaveBeenCalledWith(
      "Clerk request failed in auth.setDemoStatus",
      expect.objectContaining({
        clerkOperation: "users.getUser",
        status: 503,
      }),
    );
  });

  it("records Clerk diagnostics and rethrows when updateUserMetadata fails", async () => {
    mockedDemoUsers.isDemoStatusSet.mockReturnValue(false);
    const clerkError = Object.assign(new Error("Metadata write failed"), {
      name: "ClerkAPIResponseError",
      isClerkApiResponseError: true,
      status: 429,
      clerkTraceId: "trace_456",
      retryAfter: 30,
      errors: [{ code: "too_many_requests", message: "Rate limited" }],
    });
    updateUserMetadata.mockRejectedValue(clerkError);

    await expect(createCaller().setDemoStatus()).rejects.toMatchObject({
      cause: clerkError,
    });

    expect(Sentry.setTag).toHaveBeenCalledWith(
      "clerk.operation",
      "users.updateUserMetadata",
    );
    expect(Sentry.setTag).toHaveBeenCalledWith("clerk.status", "429");
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "clerk",
      expect.objectContaining({
        procedure: "auth.setDemoStatus",
        clerkOperation: "users.updateUserMetadata",
        userId: "user_123",
        requestUrl: "https://example.com/api/trpc/main/auth.setDemoStatus",
        cfIpCountry: "GB",
        errorName: "ClerkAPIResponseError",
        errorMessage: "Metadata write failed",
        status: 429,
        clerkTraceId: "trace_456",
        retryAfter: 30,
        clerkErrors: [{ code: "too_many_requests", message: "Rate limited" }],
      }),
    );
    expect(authLoggerError).toHaveBeenCalledWith(
      "Clerk request failed in auth.setDemoStatus",
      expect.objectContaining({
        clerkOperation: "users.updateUserMetadata",
        status: 429,
      }),
    );
  });
});
