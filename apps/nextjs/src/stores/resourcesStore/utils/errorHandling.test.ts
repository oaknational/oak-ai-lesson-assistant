import * as Sentry from "@sentry/nextjs";
import { TRPCClientError } from "@trpc/client";

import { handleStoreError } from "./errorHandling";

describe("handleStoreError", () => {
  const set = jest.fn();

  const sentrySpy = jest
    .spyOn(Sentry, "captureException")
    .mockImplementation(() => "mocked-id");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles TRPCClientError with RateLimitExceededError", () => {
    const error = new TRPCClientError(
      "RateLimitExceededError: Too many requests",
    );
    handleStoreError(set, error);
    expect(set).toHaveBeenCalledWith({
      error: { type: "rate_limit", message: error.message },
    });
    expect(sentrySpy).toHaveBeenCalledWith(error);
  });

  it("handles TRPCClientError with UserBannedError", () => {
    const error = new TRPCClientError("UserBannedError: User is banned");
    handleStoreError(set, error);
    expect(set).toHaveBeenCalledWith({
      error: { type: "banned", message: error.message },
    });
    expect(sentrySpy).toHaveBeenCalledWith(error);
  });

  it("handles generic TRPCClientError", () => {
    const error = new TRPCClientError("Some other error");
    handleStoreError(set, error);
    expect(set).toHaveBeenCalledWith({
      error: { type: "unknown", message: error.message },
    });
    expect(sentrySpy).toHaveBeenCalledWith(error);
  });

  it("handles standard Error", () => {
    const error = new Error("Standard error");
    handleStoreError(set, error);
    expect(set).toHaveBeenCalledWith({
      error: { type: "unknown", message: error.message },
    });
    expect(sentrySpy).toHaveBeenCalledWith(error);
  });

  it("handles non-Error object", () => {
    handleStoreError(set, "A string error");
    expect(set).toHaveBeenCalledWith({
      error: { type: "unknown", message: "A string error" },
    });
    expect(sentrySpy).toHaveBeenCalledWith("A string error");
  });

  it("handles undefined error", () => {
    handleStoreError(set, undefined);
    expect(set).toHaveBeenCalledWith({
      error: { type: "unknown", message: "An unknown error occurred" },
    });
    expect(sentrySpy).toHaveBeenCalledWith(undefined);
  });

  it("logs context if provided", () => {
    const error = new Error("Context error");
    const context = { foo: "bar" };
    handleStoreError(set, error, context);
    expect(set).toHaveBeenCalledWith({
      error: { type: "unknown", message: error.message },
    });
    expect(sentrySpy).toHaveBeenCalledWith(error);
  });
});
