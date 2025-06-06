import type { AilaPluginContext } from "@oakai/aila/src/core/plugins";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection/types";
import { inngest } from "@oakai/core/src/inngest";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { Moderation } from "@prisma/client";

import { createWebActionsPlugin } from "./webActionsPlugin";

jest.mock("@oakai/core/src/inngest", () => ({
  __esModule: true,

  inngest: {
    createFunction: jest.fn(),
    send: jest.fn(),
  },
}));

describe("webActionsPlugin", () => {
  describe("onToxicModeration", () => {
    it("should record a safety violation when a toxic moderation action is performed", async () => {
      const recordViolation = jest.fn();
      const safetyViolations = jest.fn().mockImplementation(() => ({
        recordViolation,
      }));

      const prisma = {} as unknown as PrismaClientWithAccelerate;
      const moderation = {
        id: "ABC",
        categories: ["t/encouragement-illegal-activity"],
        justification: "Test justification",
      } as Moderation;
      const mockEnqueue = jest.fn();
      const pluginContext = {
        aila: { userId: "user_abc" } as unknown as AilaPluginContext["aila"],
        enqueue: mockEnqueue,
      };

      const plugin = createWebActionsPlugin(prisma, safetyViolations);
      await plugin.onToxicModeration(moderation, pluginContext);

      expect(recordViolation).toHaveBeenCalledWith(
        "user_abc",
        "CHAT_MESSAGE",
        "MODERATION",
        "MODERATION",
        "ABC",
      );
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it("should notify slack", async () => {
      const safetyViolations = jest.fn().mockImplementation(() => ({
        recordViolation: jest.fn(),
      }));

      const prisma = {} as unknown as PrismaClientWithAccelerate;
      const moderation = {
        id: "ABC",
        categories: ["t/encouragement-illegal-activity"],
        justification: "Test justification",
      } as Moderation;
      const mockEnqueue = jest.fn();
      const pluginContext = {
        aila: {
          userId: "user_abc",
          chatId: "chat_abc",
        } as unknown as AilaPluginContext["aila"],
        enqueue: mockEnqueue,
      };

      const plugin = createWebActionsPlugin(prisma, safetyViolations);
      await plugin.onToxicModeration(moderation, pluginContext);

      expect(inngest.send).toHaveBeenCalledWith({
        name: "app/slack.notifyModeration",
        user: {
          id: "user_abc",
        },
        data: {
          chatId: "chat_abc",
          justification: "Test justification",
          categories: ["t/encouragement-illegal-activity"],
        },
      });
    });
  });

  it("should enqueue an account lock action when the user becomes banned", async () => {
    const recordViolation = jest
      .fn()
      .mockRejectedValue(new UserBannedError("error"));
    const safetyViolations = jest.fn().mockImplementation(() => ({
      recordViolation,
    }));

    const prisma = {} as unknown as PrismaClientWithAccelerate;
    const moderation = {
      id: "ABC",
      categories: ["t/encouragement-illegal-activity"],
      justification: "Test justification",
    } as Moderation;
    const mockEnqueue = jest.fn();
    const pluginContext = {
      aila: { userId: "user_abc" } as unknown as AilaPluginContext["aila"],
      enqueue: mockEnqueue,
    };

    const plugin = createWebActionsPlugin(prisma, safetyViolations);
    await plugin.onToxicModeration(moderation, pluginContext);

    expect(recordViolation).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalledWith({
      type: "action",
      action: "SHOW_ACCOUNT_LOCKED",
    });
  });
});

describe("onStreamError", () => {
  it("should record a safety violation when a threat error is encountered", async () => {
    const recordViolation = jest.fn();
    const safetyViolations = jest.fn().mockImplementation(() => ({
      recordViolation,
    }));
    const mockEnqueue = jest.fn();
    const prisma = {} as unknown as PrismaClientWithAccelerate;
    const pluginContext = {
      aila: {
        userId: "user_abc",
        chatId: "chat_abc",
      } as unknown as AilaPluginContext["aila"],
      enqueue: mockEnqueue,
    };

    const plugin = createWebActionsPlugin(prisma, safetyViolations);
    await expect(async () => {
      await plugin.onStreamError(
        new AilaThreatDetectionError("user_abc", "test"),
        pluginContext,
      );
    }).rejects.toThrow("test");

    expect(recordViolation).toHaveBeenCalledWith(
      "user_abc",
      "CHAT_MESSAGE",
      "THREAT",
      "CHAT_SESSION",
      "chat_abc",
    );
    expect(mockEnqueue).toHaveBeenCalledWith({
      type: "error",
      value: "Threat detected",
      message:
        "I wasn't able to process your request because a potentially malicious input was detected.",
    });
    expect(mockEnqueue).toHaveBeenCalledWith({
      message: "test",
      type: "error",
      value: "Sorry, an error occurred: test",
    });
  });

  it("should enqueue an account lock action when the user becomes banned", async () => {
    const recordViolation = jest
      .fn()
      .mockRejectedValue(new UserBannedError("error"));
    const safetyViolations = jest.fn().mockImplementation(() => ({
      recordViolation,
    }));
    const mockEnqueue = jest.fn();
    const prisma = {} as unknown as PrismaClientWithAccelerate;
    const pluginContext = {
      aila: { userId: "user_abc" } as unknown as AilaPluginContext["aila"],
      enqueue: mockEnqueue,
    };

    const plugin = createWebActionsPlugin(prisma, safetyViolations);
    await expect(async () => {
      await plugin.onStreamError(
        new AilaThreatDetectionError("user_abc", "test"),
        pluginContext,
      );
    }).rejects.toThrow("test");

    expect(recordViolation).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalledWith({
      type: "action",
      action: "SHOW_ACCOUNT_LOCKED",
    });
  });
});
