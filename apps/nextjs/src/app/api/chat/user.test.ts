import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";

import { reportRateLimitError } from "./user";

jest.mock("@oakai/core/src/inngest", () => ({
  inngest: {
    createFunction: jest.fn(),
    send: jest.fn(),
  },
}));

describe("chat route user functions", () => {
  describe("reportRateLimitError", () => {
    it("should report rate limit exceeded to PostHog when userId is provided", async () => {
      jest.spyOn(posthogAiBetaServerClient, "identify");
      jest.spyOn(posthogAiBetaServerClient, "capture");
      jest.spyOn(posthogAiBetaServerClient, "shutdown");

      const userId = "testUserId";
      const error = new RateLimitExceededError(
        userId,
        100,
        Date.now() + 3600 * 1000,
      );
      const chatId = "testChatId";

      await reportRateLimitError(error, userId, chatId);

      expect(posthogAiBetaServerClient.identify).toHaveBeenCalledWith({
        distinctId: userId,
      });
      expect(posthogAiBetaServerClient.capture).toHaveBeenCalledWith({
        distinctId: userId,
        event: "open_ai_completion_rate_limited",
        properties: {
          chat_id: chatId,
          limit: error.limit,
          resets_at: error.reset,
        },
      });
      expect(posthogAiBetaServerClient.shutdown).toHaveBeenCalled();
    });

    it("should trigger a slack notification", async () => {
      const { inngest } = await import("@oakai/core/src/inngest");

      const mockPosthogClient = {
        identify: jest.fn(),
        capture: jest.fn(),
        shutdown: jest.fn().mockResolvedValue(undefined),
      };
      jest.mock("@oakai/core/src/analytics/posthogAiBetaServerClient", () => ({
        posthogAiBetaServerClient: mockPosthogClient,
      }));

      const userId = "testUserId";
      const error = new RateLimitExceededError(
        userId,
        10,
        Date.now() + 3600 * 1000,
      );
      const chatId = "testChatId";

      await reportRateLimitError(error, userId, chatId);

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
  });
});
