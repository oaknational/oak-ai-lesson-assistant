import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";

import * as Sentry from "@sentry/node";
import { APICallError } from "ai";
import invariant from "tiny-invariant";

import {
  consumeStream,
  extractStreamMessage,
} from "@/utils/testHelpers/consumeStream";

import { handleChatException } from "./errorHandling";

jest.mock("@oakai/db", () => ({
  prisma: {},
}));

jest.mock("@sentry/node", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

describe("handleChatException", () => {
  describe("AilaAuthenticationError", () => {
    it("should return an error chat message", async () => {
      const error = new AilaAuthenticationError("test error");
      const response = await handleChatException(error);

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
      const error = new RateLimitExceededError(
        "user_abc",
        100,
        Date.now() + 3600 * 1000,
      );
      const response = await handleChatException(error);

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

  describe("generic Error", () => {
    it("should return a generic error message without leaking internal details", async () => {
      const error = new Error("Missing environment variable OPENAI_API_KEY");
      const response = await handleChatException(error);

      expect(response.status).toBe(200);

      invariant(
        response.body instanceof ReadableStream,
        "Expected response.body to be a ReadableStream",
      );

      const consumed = await consumeStream(response.body);
      const message = extractStreamMessage(consumed);

      expect(message).toEqual({
        type: "error",
        message: "An unexpected error occurred",
        value: "Sorry, an unexpected error occurred. Please try again later.",
      });
    });
  });

  describe("upstream AI provider error", () => {
    it("should return a temporary AI service message and capture a warning", async () => {
      const providerError = new APICallError({
        message:
          "500 The server had an error while processing your request. Sorry about that!",
        url: "https://oai.eu.hconeai.com/v1/chat/completions",
        requestBodyValues: {},
        statusCode: 500,
      });
      const error = new Error("Unexpected error in chat route", {
        cause: providerError,
      });
      const response = await handleChatException(error);

      expect(response.status).toBe(200);

      invariant(
        response.body instanceof ReadableStream,
        "Expected response.body to be a ReadableStream",
      );

      const consumed = await consumeStream(response.body);
      const message = extractStreamMessage(consumed);

      expect(message).toEqual({
        type: "error",
        message: "The AI service is temporarily unavailable",
        value:
          "The AI service is temporarily unavailable. Please try again shortly.",
      });
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        "Upstream AI provider error",
        expect.objectContaining({
          level: "warning",
          extra: expect.objectContaining({
            statusCode: 500,
            url: "https://oai.eu.hconeai.com/v1/chat/completions",
          }),
        }),
      );
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe("UserBannedError", () => {
    it("should return an error chat message", async () => {
      const error = new UserBannedError("test error");
      const response = await handleChatException(error);

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
