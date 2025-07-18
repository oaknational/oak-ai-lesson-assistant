import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection/types";
import * as moderationErrorHandling from "@oakai/aila/src/utils/threatDetection/threatDetectionHandling";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { TracingSpan } from "@oakai/core/src/tracing";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import invariant from "tiny-invariant";

import {
  consumeStream,
  extractStreamMessage,
} from "@/utils/testHelpers/consumeStream";

import { handleChatException } from "./errorHandling";

describe("handleChatException", () => {
  describe("AilaThreatDetectionError", () => {
    it("should forward the message from handleThreatDetectionError", async () => {
      jest
        .spyOn(moderationErrorHandling, "handleThreatDetectionError")
        .mockResolvedValue({
          type: "error",
          value: "Threat detected",
          message: "Threat was detected",
        });

      const span = { setTag: jest.fn() } as unknown as TracingSpan;
      const error = new AilaThreatDetectionError("user_abc", "test error");
      const prisma = {} as unknown as PrismaClientWithAccelerate;

      const response = await handleChatException(error, "test-chat-id", prisma);

      expect(response.status).toBe(200);

      invariant(response.body);
      const message = extractStreamMessage(await consumeStream(response.body));

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

      const response = await handleChatException(error, "test-chat-id", prisma);

      expect(response.status).toBe(401);

      invariant(
        response.body instanceof ReadableStream,
        "Expected response.body to be a ReadableStream",
      );

      const message = await consumeStream(response.body);
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

      const response = await handleChatException(error, "test-chat-id", prisma);

      expect(response.status).toBe(200);

      invariant(
        response.body instanceof ReadableStream,
        "Expected response.body to be a ReadableStream",
      );

      const consumed = await consumeStream(response.body);
      const message = extractStreamMessage(consumed);

      expect(message).toEqual({
        type: "error",
        value: "Rate limit exceeded",
        message:
          "**Unfortunately you’ve exceeded your fair usage limit for today.** Please come back in 1 hour. If you require a higher limit, please [make a request](https://share.hsforms.com/118hyngR-QSS0J7vZEVlRSgbvumd).",
      });
    });
  });

  describe("UserBannedError", () => {
    it("should return an error chat message", async () => {
      const span = { setTag: jest.fn() } as unknown as TracingSpan;
      const error = new UserBannedError("test error");
      const prisma = {} as unknown as PrismaClientWithAccelerate;

      const response = await handleChatException(error, "test-chat-id", prisma);

      expect(response.status).toBe(200);

      invariant(
        response.body instanceof ReadableStream,
        "Expected response.body to be a ReadableStream",
      );

      const message = extractStreamMessage(await consumeStream(response.body));
      expect(message).toEqual({
        type: "action",
        action: "SHOW_ACCOUNT_LOCKED",
      });
    });
  });
});
