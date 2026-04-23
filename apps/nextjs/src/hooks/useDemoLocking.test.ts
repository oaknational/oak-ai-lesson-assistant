/**
 * @jest-environment jsdom
 */
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";

import { renderHook } from "@testing-library/react";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { isLessonComplete } from "@/lib/analytics/helpers";
import { useChatStore } from "@/stores/AilaStoresProvider";
import type { AiMessage } from "@/stores/chatStore";

import {
  findFirstCompleteAssistantMessage,
  replayLessonPlanFromMessages,
  useDemoLocking,
} from "./useDemoLocking";

jest.mock("@/components/ContextProviders/Demo", () => ({
  useDemoUser: jest.fn(),
}));
jest.mock("@/lib/analytics/helpers", () => ({
  isLessonComplete: jest.fn(),
}));
jest.mock("@/stores/AilaStoresProvider", () => ({
  useChatStore: jest.fn(),
}));

const fixedDate = new Date("2023-01-01T12:00:00.000Z");

// Helper to create a message with patches
const createAssistantMessageWithPatches = (
  id: string,
  patches: Array<{ op: "add" | "replace"; path: string; value: unknown }>,
): AiMessage => {
  const patchContent = patches
    .map(
      (patch) =>
        `{\n  "type": "patch",\n  "reasoning": "test",\n  "value": ${JSON.stringify(patch)},\n  "status": "complete"\n}`,
    )
    .map((patch) => `␞\n${patch}\n␞`)
    .join("\n");

  return {
    id,
    role: "assistant",
    content: patchContent,
    createdAt: fixedDate,
  };
};

const createUserMessage = (id: string, content: string): AiMessage => {
  return {
    id,
    role: "user",
    content,
    createdAt: fixedDate,
  };
};

const isLessonCompleteMock = (lesson: PartialLessonPlan): boolean => {
  // A lesson is complete when it has title and subject for the tests
  return !!(lesson.title && lesson.subject);
};

describe("useDemoLocking helpers", () => {
  describe("replayLessonPlanFromMessages", () => {
    it("returns empty object when there are no messages", () => {
      const messages: AiMessage[] = [];
      const result = replayLessonPlanFromMessages(messages);

      expect(result).toEqual({});
    });

    it("skips user messages", () => {
      const messages: AiMessage[] = [createUserMessage("u1", "Hello")];
      const result = replayLessonPlanFromMessages(messages);

      expect(result).toEqual({});
    });

    it("applies patches from assistant messages in order", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "My Lesson" },
        ]),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/subject", value: "English" },
        ]),
      ];

      const result = replayLessonPlanFromMessages(messages);

      expect(result).toEqual({
        title: "My Lesson",
        subject: "English",
      });
    });

    it("handles multiple patches in a single message", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "My Lesson" },
          { op: "add", path: "/subject", value: "Math" },
        ]),
      ];

      const result = replayLessonPlanFromMessages(messages);

      expect(result).toEqual({
        title: "My Lesson",
        subject: "Math",
      });
    });

    it("replaces values when using replace operation", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "First Title" },
        ]),
        createAssistantMessageWithPatches("a2", [
          { op: "replace", path: "/title", value: "Second Title" },
        ]),
      ];

      const result = replayLessonPlanFromMessages(messages);

      expect(result.title).toBe("Second Title");
    });

    it("mixes user and assistant messages, only applying assistant patches", () => {
      const messages: AiMessage[] = [
        createUserMessage("u1", "Create a lesson"),
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Lesson Title" },
        ]),
        createUserMessage("u2", "Continue"),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/subject", value: "Science" },
        ]),
      ];

      const result = replayLessonPlanFromMessages(messages);

      expect(result).toEqual({
        title: "Lesson Title",
        subject: "Science",
      });
    });
  });

  describe("findFirstCompleteAssistantMessage", () => {
    it("returns null when no messages", () => {
      const messages: AiMessage[] = [];
      const result = findFirstCompleteAssistantMessage(
        messages,
        isLessonCompleteMock,
      );

      expect(result).toBeNull();
    });

    it("returns null when completeness is never achieved", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Just a title" },
        ]),
      ];

      const result = findFirstCompleteAssistantMessage(
        messages,
        isLessonCompleteMock,
      );

      expect(result).toBeNull();
    });

    it("returns the message where completeness first becomes true", () => {
      const messages: AiMessage[] = [
        createUserMessage("u1", "Start"),
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Lesson" },
        ]),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/subject", value: "Math" },
        ]),
      ];

      const result = findFirstCompleteAssistantMessage(
        messages,
        isLessonCompleteMock,
      );

      expect(result?.id).toBe("a2");
    });

    it("returns first complete message even if later messages exist", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Lesson" },
          { op: "add", path: "/subject", value: "Math" },
        ]),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/topic", value: "Algebra" },
        ]),
      ];

      const result = findFirstCompleteAssistantMessage(
        messages,
        isLessonCompleteMock,
      );

      expect(result?.id).toBe("a1");
    });

    it("skips incomplete messages before finding complete one", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "First" },
        ]),
        createUserMessage("u1", "User input"),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/subject", value: "English" },
        ]),
      ];

      const result = findFirstCompleteAssistantMessage(
        messages,
        isLessonCompleteMock,
      );

      expect(result?.id).toBe("a2");
    });

    it("correctly handles completeness flip with custom predicate", () => {
      const strictComplete = (lesson: PartialLessonPlan): boolean => {
        // Considered complete when has 3+ required fields
        const fieldsPresent = [
          lesson.title,
          lesson.subject,
          lesson.keyStage,
        ].filter(Boolean).length;
        return fieldsPresent >= 3;
      };

      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Lesson" },
        ]),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/subject", value: "Math" },
        ]),
        createAssistantMessageWithPatches("a3", [
          { op: "add", path: "/keyStage", value: "Key Stage 3" },
        ]),
      ];

      const result = findFirstCompleteAssistantMessage(
        messages,
        strictComplete,
      );

      expect(result?.id).toBe("a3");
    });

    it("remains on first complete message even if messages come after", () => {
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Lesson" },
          { op: "add", path: "/subject", value: "Math" },
        ]),
        createUserMessage("u1", "More input"),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/topic", value: "Geometry" },
        ]),
      ];

      const result = findFirstCompleteAssistantMessage(
        messages,
        isLessonCompleteMock,
      );

      expect(result?.id).toBe("a1");
    });
  });

  describe("useDemoLocking hook", () => {
    const mockUseDemoUser = jest.mocked(useDemoUser);
    const mockUseChatStore = jest.mocked(useChatStore);
    const mockIsLessonComplete = jest.mocked(isLessonComplete);

    beforeEach(() => {
      jest.clearAllMocks();

      // Set up default mocks
      mockUseDemoUser.mockReturnValue({
        isDemoUser: false,
        demo: undefined,
        isSharingEnabled: true,
      });
      mockUseChatStore.mockReturnValue([]);
      mockIsLessonComplete.mockReturnValue(false);
    });

    it("returns false when user is not a demo user", () => {
      mockUseDemoUser.mockReturnValue({
        isDemoUser: false,
        demo: undefined,
        isSharingEnabled: true,
      });
      mockUseChatStore.mockReturnValue([]);

      const { result } = renderHook(() => useDemoLocking());

      expect(result.current).toBe(false);
    });

    it("returns false when demo user has no complete lesson", () => {
      mockUseDemoUser.mockReturnValue({
        isDemoUser: true,
        demo: {
          appSessionsRemaining: 1,
          additionalMaterialsSessionsRemaining: 1,
          appSessionsPerMonth: 5,
          contactHref: "https://example.com",
        },
        isSharingEnabled: true,
      });
      const incompleteMessages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Just a title" },
        ]),
      ];
      mockUseChatStore.mockReturnValue(incompleteMessages);

      const { result } = renderHook(() => useDemoLocking());

      expect(result.current).toBe(false);
    });

    it("returns false when demo user has complete lesson but fewer user messages than threshold", () => {
      mockUseDemoUser.mockReturnValue({
        isDemoUser: true,
        demo: {
          appSessionsRemaining: 1,
          additionalMaterialsSessionsRemaining: 1,
          appSessionsPerMonth: 5,
          contactHref: "https://example.com",
        },
        isSharingEnabled: true,
      });
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Complete" },
          { op: "add", path: "/subject", value: "Math" },
        ]),
        createUserMessage("u1", "Edit 1"),
      ];
      mockUseChatStore.mockReturnValue(messages);
      mockIsLessonComplete.mockImplementation((lesson: PartialLessonPlan) => {
        return !!(lesson.title && lesson.subject);
      });

      const { result } = renderHook(() => useDemoLocking());

      // With NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE = 3, 1 user message should be false
      expect(result.current).toBe(false);
    });

    it("returns true when demo user reaches the message threshold after completion", () => {
      mockUseDemoUser.mockReturnValue({
        isDemoUser: true,
        demo: {
          appSessionsRemaining: 1,
          additionalMaterialsSessionsRemaining: 1,
          appSessionsPerMonth: 5,
          contactHref: "https://example.com",
        },
        isSharingEnabled: true,
      });
      // Simulate exactly NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE user messages after complete
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Complete" },
          { op: "add", path: "/subject", value: "Math" },
        ]),
        createUserMessage("u1", "Edit 1"),
        createUserMessage("u2", "Edit 2"),
        createUserMessage("u3", "Edit 3"),
      ];
      mockUseChatStore.mockReturnValue(messages);
      mockIsLessonComplete.mockImplementation((lesson: PartialLessonPlan) => {
        return !!(lesson.title && lesson.subject);
      });

      const { result } = renderHook(() => useDemoLocking());

      // With NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE = 3, exactly 3 user messages should be true
      expect(result.current).toBe(true);
    });

    it("returns true when demo user exceeds threshold after completion", () => {
      mockUseDemoUser.mockReturnValue({
        isDemoUser: true,
        demo: {
          appSessionsRemaining: 1,
          additionalMaterialsSessionsRemaining: 1,
          appSessionsPerMonth: 5,
          contactHref: "https://example.com",
        },
        isSharingEnabled: true,
      });
      // Simulate more than NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE user messages
      const messages: AiMessage[] = [
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Complete" },
          { op: "add", path: "/subject", value: "Math" },
        ]),
        createUserMessage("u1", "Edit 1"),
        createUserMessage("u2", "Edit 2"),
        createUserMessage("u3", "Edit 3"),
        createUserMessage("u4", "Edit 4"),
      ];
      mockUseChatStore.mockReturnValue(messages);
      mockIsLessonComplete.mockImplementation((lesson: PartialLessonPlan) => {
        return !!(lesson.title && lesson.subject);
      });

      const { result } = renderHook(() => useDemoLocking());

      // With NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE = 3, more than 3 should still be true (>= comparison)
      expect(result.current).toBe(true);
    });

    it("counts only user messages after the first complete message", () => {
      mockUseDemoUser.mockReturnValue({
        isDemoUser: true,
        demo: {
          appSessionsRemaining: 1,
          additionalMaterialsSessionsRemaining: 1,
          appSessionsPerMonth: 5,
          contactHref: "https://example.com",
        },
        isSharingEnabled: true,
      });
      const messages: AiMessage[] = [
        createUserMessage("u1", "Start"),
        createAssistantMessageWithPatches("a1", [
          { op: "add", path: "/title", value: "Lesson" },
        ]),
        createUserMessage("u2", "Edit before complete"),
        createAssistantMessageWithPatches("a2", [
          { op: "add", path: "/subject", value: "Math" },
        ]),
        // First complete message is a2, count user messages after this
        createUserMessage("u3", "Edit 1 after complete"),
        createUserMessage("u4", "Edit 2 after complete"),
      ];
      mockUseChatStore.mockReturnValue(messages);
      mockIsLessonComplete.mockImplementation((lesson: PartialLessonPlan) => {
        return !!(lesson.title && lesson.subject);
      });

      const { result } = renderHook(() => useDemoLocking());

      // Only u3 and u4 should be counted (2 messages), which is less than threshold (3)
      expect(result.current).toBe(false);
    });
  });
});
