import type { AilaPluginContext } from "@oakai/aila/src/core/plugins";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection/types";
import { UserBannedError, scheduleModerationNotification } from "@oakai/core";
import type * as OakCore from "@oakai/core";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { Moderation } from "@prisma/client";

import { createWebActionsPlugin } from "./webActionsPlugin";

jest.mock("@oakai/core", () => {
  const actualCore = jest.requireActual<typeof OakCore>("@oakai/core");

  return {
    ...actualCore,
    scheduleModerationNotification: jest.fn(),
    scheduleThreatDetectionAilaNotification: jest.fn(),
  };
});

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

      expect(scheduleModerationNotification).toHaveBeenCalledWith({
        user: {
          id: "user_abc",
        },
        data: {
          chatId: "chat_abc",
          justification: "Test justification",
          categories: ["t/encouragement-illegal-activity"],
          safetyLevel: "toxic",
        },
      });
    });
  });

  describe("onHighlySensitiveModeration", () => {
    it("should notify slack with highly-sensitive safetyLevel", async () => {
      const prisma = {} as unknown as PrismaClientWithAccelerate;
      const moderation = {
        id: "ABC",
        categories: ["n/self-harm-suicide"],
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

      const plugin = createWebActionsPlugin(prisma);
      await plugin.onHighlySensitiveModeration!(moderation, pluginContext);

      expect(scheduleModerationNotification).toHaveBeenCalledWith({
        user: {
          id: "user_abc",
        },
        data: {
          chatId: "chat_abc",
          justification: "Test justification",
          categories: ["n/self-harm-suicide"],
          safetyLevel: "highly-sensitive",
        },
      });
    });

    it("should not record a safety violation", async () => {
      const recordViolation = jest.fn();
      const safetyViolations = jest.fn().mockImplementation(() => ({
        recordViolation,
      }));

      const prisma = {} as unknown as PrismaClientWithAccelerate;
      const moderation = {
        id: "ABC",
        categories: ["n/self-harm-suicide"],
        justification: "Test justification",
      } as Moderation;
      const pluginContext = {
        aila: { userId: "user_abc" } as unknown as AilaPluginContext["aila"],
        enqueue: jest.fn(),
      };

      const plugin = createWebActionsPlugin(prisma, safetyViolations);
      await plugin.onHighlySensitiveModeration!(moderation, pluginContext);

      expect(recordViolation).not.toHaveBeenCalled();
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
    const createViolation = jest
      .fn()
      .mockResolvedValue({ id: "violation-123" });
    const enforceThreshold = jest.fn().mockResolvedValue(undefined);
    const safetyViolations = jest.fn().mockImplementation(() => ({
      createViolation,
      enforceThreshold,
    }));
    const createThreatDetection = jest.fn().mockResolvedValue(undefined);
    const threatDetections = jest.fn().mockImplementation(() => ({
      create: createThreatDetection,
    }));
    const mockEnqueue = jest.fn();
    const prisma = {} as unknown as PrismaClientWithAccelerate;
    const pluginContext = {
      aila: {
        userId: "user_abc",
        chatId: "chat_abc",
        messages: [
          {
            id: "message_abc",
            role: "user",
            content: "test threat",
          },
        ],
      } as unknown as AilaPluginContext["aila"],
      enqueue: mockEnqueue,
    };

    const plugin = createWebActionsPlugin(
      prisma,
      safetyViolations,
      threatDetections,
    );
    await expect(async () => {
      await plugin.onStreamError(
        new AilaThreatDetectionError("user_abc", "test"),
        pluginContext,
      );
    }).rejects.toThrow("test");

    expect(createViolation).toHaveBeenCalledWith(
      "user_abc",
      "CHAT_MESSAGE",
      "THREAT",
      "CHAT_SESSION",
      "chat_abc",
    );
    expect(createThreatDetection).toHaveBeenCalledWith({
      appSessionId: "chat_abc",
      recordType: "CHAT_SESSION",
      recordId: "chat_abc",
      messageId: "message_abc",
      userId: "user_abc",
      threateningMessage: "test threat",
      provider: "unknown",
      category: "other",
      severity: "high",
      providerResponse: undefined,
      safetyViolationId: "violation-123",
    });
    expect(enforceThreshold).toHaveBeenCalledWith("user_abc");
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
    const createViolation = jest
      .fn()
      .mockResolvedValue({ id: "violation-456" });
    const enforceThreshold = jest
      .fn()
      .mockRejectedValue(new UserBannedError("error"));
    const safetyViolations = jest.fn().mockImplementation(() => ({
      createViolation,
      enforceThreshold,
    }));
    const threatDetections = jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue(undefined),
    }));
    const mockEnqueue = jest.fn();
    const prisma = {} as unknown as PrismaClientWithAccelerate;
    const pluginContext = {
      aila: {
        userId: "user_abc",
      } as unknown as AilaPluginContext["aila"],
      enqueue: mockEnqueue,
    };

    const plugin = createWebActionsPlugin(
      prisma,
      safetyViolations,
      threatDetections,
    );
    await expect(async () => {
      await plugin.onStreamError(
        new AilaThreatDetectionError("user_abc", "test"),
        pluginContext,
      );
    }).rejects.toThrow("test");

    expect(createViolation).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalledWith({
      type: "action",
      action: "SHOW_ACCOUNT_LOCKED",
    });
  });
});
