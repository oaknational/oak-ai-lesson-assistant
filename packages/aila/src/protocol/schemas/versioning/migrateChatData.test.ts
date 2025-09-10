import { describe, expect, it, jest } from "@jest/globals";

import {
  baseChatData,
  chatWithNullLessonPlan,
  chatWithStringLessonPlan,
  chatWithV1Quiz,
  chatWithV2Quiz,
  invalidChatData,
  mockV2Quiz,
} from "./fixtures/migrationTestData";
import { migrateChatData } from "./migrateChatData";

const testContext = {
  id: "test-chat-id",
  userId: "test-user-id",
  caller: "test",
};

describe("migrateChatData", () => {
  describe("valid chat data migration", () => {
    it("should handle chat data with V1 and V2 quizzes", async () => {
      // Should migrate V1 quizzes
      const v1Result = await migrateChatData(chatWithV1Quiz, null, testContext);
      expect(v1Result.id).toBe("test-chat-id");
      expect(v1Result.lessonPlan.title).toBe("Test Lesson");
      expect(v1Result.lessonPlan.starterQuiz).toHaveProperty("version", "v2");
      expect(v1Result.lessonPlan.exitQuiz).toHaveProperty("version", "v2");

      // Should not migrate V2 quizzes
      const v2Result = await migrateChatData(chatWithV2Quiz, null, testContext);
      expect(v2Result.id).toBe("test-chat-id");
      expect(v2Result.lessonPlan.starterQuiz).toEqual(mockV2Quiz);
      expect(v2Result.lessonPlan.exitQuiz).toEqual(mockV2Quiz);

      // Should preserve all chat fields
      expect(v1Result.id).toBe(baseChatData.id);
      expect(v1Result.path).toBe(baseChatData.path);
      expect(v1Result.title).toBe(baseChatData.title);
      expect(v1Result.userId).toBe(baseChatData.userId);
      expect(v1Result.createdAt).toBe(baseChatData.createdAt);
      expect(v1Result.messages).toEqual(baseChatData.messages);
    });
  });

  describe("persistence callback", () => {
    it("should handle persistence callbacks correctly", async () => {
      const mockPersist = jest
        .fn<() => Promise<void>>()
        .mockResolvedValue(undefined);

      // Should call when migration occurs
      await migrateChatData(chatWithV1Quiz, mockPersist, testContext);
      expect(mockPersist).toHaveBeenCalledTimes(1);
      expect(mockPersist).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-chat-id",
          lessonPlan: expect.objectContaining({
            starterQuiz: expect.objectContaining({ version: "v2" }),
          }),
        }),
      );

      mockPersist.mockClear();

      // Should not call when no migration needed
      await migrateChatData(chatWithV2Quiz, mockPersist, testContext);
      expect(mockPersist).not.toHaveBeenCalled();
    });

    it("should propagate persistence errors", async () => {
      const mockError = new Error("Persistence failed");
      const mockPersist = jest
        .fn<() => Promise<void>>()
        .mockImplementation(async () => {
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
