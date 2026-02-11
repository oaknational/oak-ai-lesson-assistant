import { describe, expect, it, jest } from "@jest/globals";

import {
  baseChatData,
  chatWithNullLessonPlan,
  chatWithStringLessonPlan,
  chatWithV1Quiz,
  chatWithV3Quiz,
  invalidChatData,
} from "./fixtures/migrationTestData";
import { migrateChatData } from "./migrateChatData";

const testContext = {
  id: "test-chat-id",
  userId: "test-user-id",
  caller: "test",
};

describe("migrateChatData", () => {
  describe("chat data integration", () => {
    it("should migrate lesson plans when needed and preserve chat structure", async () => {
      // Should migrate when lesson plan needs migration
      const result = await migrateChatData(chatWithV1Quiz, null, testContext);

      expect(result.id).toBe("test-chat-id");
      expect(result.lessonPlan.title).toBe("Test Lesson");
      expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v3");

      // Should preserve all chat fields
      expect(result.id).toBe(baseChatData.id);
      expect(result.path).toBe(baseChatData.path);
      expect(result.title).toBe(baseChatData.title);
      expect(result.userId).toBe(baseChatData.userId);
      expect(result.createdAt).toBe(baseChatData.createdAt);
      expect(result.messages).toEqual(baseChatData.messages);
    });

    it("should not migrate when lesson plan doesn't need migration", async () => {
      const result = await migrateChatData(chatWithV3Quiz, null, testContext);

      expect(result.id).toBe("test-chat-id");
      expect(result.lessonPlan.starterQuiz).toHaveProperty("version", "v3");
    });
  });

  describe("persistence callback", () => {
    it("should call persistence when migration occurs", async () => {
      const mockPersist = jest
        .fn<(chatData: unknown) => Promise<void>>()
        .mockResolvedValue(undefined);

      await migrateChatData(chatWithV1Quiz, mockPersist, testContext);
      expect(mockPersist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-chat-id",
          lessonPlan: expect.objectContaining({
            starterQuiz: expect.objectContaining({ version: "v3" }),
          }),
        }),
      );
    });

    it("should not call persistence when no migration needed", async () => {
      const mockPersist = jest
        .fn<(chatData: unknown) => Promise<void>>()
        .mockResolvedValue(undefined);

      await migrateChatData(chatWithV3Quiz, mockPersist, testContext);
      expect(mockPersist).not.toHaveBeenCalled();
    });

    it("should propagate persistence errors", async () => {
      const mockError = new Error("Persistence failed");
      const mockPersist = jest
        .fn<(chatData: unknown) => Promise<void>>()
        .mockImplementation(() => {
          throw mockError;
        });

      await expect(
        migrateChatData(chatWithV1Quiz, mockPersist, testContext),
      ).rejects.toThrow("test :: Failed to parse chat");
    });
  });

  describe("error handling", () => {
    it.each([
      invalidChatData,
      null,
      undefined,
      "invalid",
      123,
      chatWithStringLessonPlan,
      chatWithNullLessonPlan,
    ])("should reject invalid chat data: %p", async (chatData) => {
      await expect(
        migrateChatData(chatData, null, testContext),
      ).rejects.toThrow("Invalid chat data format");
    });
  });
});
