import { AilaAuthenticationError, AilaThreatDetectionError } from "@oakai/aila";
import * as moderationErrorHandling from "@oakai/aila/src/utils/moderation/moderationErrorHandling";
import { UserBannedError } from "@oakai/core/src/models/safetyViolations";
import { TracingSpan } from "@oakai/core/src/tracing/serverTracing";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";
import { PrismaClientWithAccelerate } from "@oakai/db";
import invariant from "tiny-invariant";

import { consumeStream } from "@/utils/testHelpers/consumeStream";

import { handleChatException } from "./errorHandling";

describe("handleChatException", () => {
  describe("AilaThreatDetectionError", () => {
    it("should forward the message from handleHeliconeError", async () => {
      jest
        .spyOn(moderationErrorHandling, "handleHeliconeError")
        .mockResolvedValue({
          type: "error",
          value: "Threat detected",
          message: "Threat was detected",
        });

      const span = { setTag: jest.fn() } as unknown as TracingSpan;
      const error = new AilaThreatDetectionError("user_abc", "test error");
      const prisma = {} as unknown as PrismaClientWithAccelerate;

      const response = await handleChatException(
        span,
        error,
        "test-chat-id",
        prisma,
      );

      expect(response.status).toBe(200);

      invariant(response.body instanceof ReadableStream);
      const message = JSON.parse(await consumeStream(response.body));
      expect(message).toEqual({
        type: "error",
        value: "Threat detected",
        message: "Threat was detected",
      });
    });
  });

  describe("AilaAuthenticationError", () => {
    it("should return an error chat message", async () => {
      const span = { setTag: jest.fn() } as unknown as TracingSpan;
      const error = new AilaAuthenticationError("test error");
      const prisma = {} as unknown as PrismaClientWithAccelerate;

      const response = await handleChatException(
        span,
        error,
        "test-chat-id",
        prisma,
      );

      expect(response.status).toBe(401);

      const message = await consumeStream(response.body as ReadableStream);
      expect(message).toEqual("Unauthorized");
    });
  });

  describe("RateLimitExceededError", () => {
    it("should return an error chat message", async () => {
      const span = { setTag: jest.fn() } as unknown as TracingSpan;
      const error = new RateLimitExceededError(
        "user_abc",
        100,
        Date.now() + 3600 * 1000,
      );
      const prisma = {} as unknown as PrismaClientWithAccelerate;

      const response = await handleChatException(
        span,
        error,
        "test-chat-id",
        prisma,
      );

      expect(response.status).toBe(200);

      const consumed = await consumeStream(response.body as ReadableStream);
      expect(consumed).toMatch(/^\{/);
      const message = JSON.parse(consumed);
      expect(message).toEqual({
        type: "error",
        value: "Rate limit exceeded",
        message:
          "**Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in 1 hour. If you require a higher limit, please [make a request](https://forms.gle/tHsYMZJR367zydsG8).",
      });
    });
  });

  describe("UserBannedError", () => {
    it("should return an error chat message", async () => {
      const span = { setTag: jest.fn() } as unknown as TracingSpan;
      const error = new UserBannedError("test error");
      const prisma = {} as unknown as PrismaClientWithAccelerate;

      const response = await handleChatException(
        span,
        error,
        "test-chat-id",
        prisma,
      );

      expect(response.status).toBe(200);

      const message = JSON.parse(
        await consumeStream(response.body as ReadableStream),
      );
      expect(message).toEqual({
        type: "action",
        action: "SHOW_ACCOUNT_LOCKED",
      });
    });
  });
});
