import { inngest } from "@oakai/core";
import { posthogServerClient } from "@oakai/core/src/analytics/posthogServerClient";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";

import { handleRateLimitError } from "./user";

jest.mock("@oakai/core/src/client", () => ({
  inngest: {
    createFunction: jest.fn(),
    send: jest.fn(),
  },
}));

describe("chat route user functions", () => {
  describe("handleRateLimitError", () => {
    it("should report rate limit exceeded to PostHog when userId is provided", async () => {
      jest.spyOn(posthogServerClient, "identify");
      jest.spyOn(posthogServerClient, "capture");
      jest.spyOn(posthogServerClient, "shutdown");
      const error = new RateLimitExceededError(100, Date.now() + 3600 * 1000);
      const chatId = "testChatId";
      const userId = "testUserId";

      await handleRateLimitError(error, userId, chatId);

      expect(posthogServerClient.identify).toHaveBeenCalledWith({
        distinctId: userId,
      });
      expect(posthogServerClient.capture).toHaveBeenCalledWith({
        distinctId: userId,
        event: "open_ai_completion_rate_limited",
        properties: {
          chat_id: chatId,
          limit: error.limit,
          resets_at: error.reset,
        },
      });
      expect(posthogServerClient.shutdown).toHaveBeenCalled();
    });

    it("should trigger a slack notification", async () => {
      const mockPosthogClient = {
        identify: jest.fn(),
        capture: jest.fn(),
        shutdown: jest.fn().mockResolvedValue(undefined),
      };
      jest.mock("@oakai/core/src/analytics/posthogServerClient", () => ({
        posthogServerClient: mockPosthogClient,
      }));

      const error = new RateLimitExceededError(10, Date.now() + 3600 * 1000);
      const chatId = "testChatId";
      const userId = "testUserId";

      await handleRateLimitError(error, userId, chatId);

      expect(inngest.send).toHaveBeenCalledTimes(1);
      expect(inngest.send).toHaveBeenCalledWith({
        name: "app/slack.notifyRateLimit",
        user: {
          id: userId,
        },
        data: {
          limit: error.limit,
          reset: new Date(error.reset),
        },
      });
    });

    it("should return an error chat message", async () => {
      const mockPosthogClient = {
        identify: jest.fn(),
        capture: jest.fn(),
        shutdown: jest.fn().mockResolvedValue(undefined),
      };
      jest.mock("@oakai/core/src/analytics/posthogServerClient", () => ({
        posthogServerClient: mockPosthogClient,
      }));
      const error = new RateLimitExceededError(100, Date.now() + 3600 * 1000);
      const chatId = "testChatId";
      const userId = "testUserId";

      const response = await handleRateLimitError(error, userId, chatId);

      expect(response).toEqual({
        type: "error",
        value: "Rate limit exceeded",
        message:
          "**Unfortunately you've exceeded your fair usage limit for today.** Please come back in 1 hour. If you require a higher limit, please [make a request](https://forms.gle/tHsYMZJR367zydsG8).",
      });
    });
  });
});
