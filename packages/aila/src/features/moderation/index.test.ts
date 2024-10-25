// Generated by CodiumAI
import { Moderations } from "@oakai/core/src/models/moderations";
import { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { type PrismaClientWithAccelerate } from "@oakai/db";

import { AilaModeration } from ".";
import { Aila } from "../..";
import { AilaChatInitializationOptions, Message } from "../../core";
import { AilaPlugin } from "../../core/plugins";
import { LooseLessonPlan } from "../../protocol/schema";
import { AilaModerator } from "./moderators";
import { MockModerator } from "./moderators/MockModerator";

// Ensure that no tests start relying on prisma
const prismaMock = {} as PrismaClientWithAccelerate;

type SetUpModerationOptions = {
  lessonPlan: LooseLessonPlan;
  chat: AilaChatInitializationOptions;
  moderator: AilaModerator;
  moderations?: Moderations;
  forcePersistence?: boolean;
  plugins?: AilaPlugin[];
};

const setUpModeration = ({
  lessonPlan,
  chat,
  moderator,
  moderations,
  forcePersistence = false,
  plugins = [],
}: SetUpModerationOptions) => {
  const aila = new Aila({
    lessonPlan,
    chat,
    options: {
      useModeration: true,
      usePersistence: false,
      useAnalytics: false,
    },
    moderator,
    prisma: prismaMock,
    plugins,
  });

  const ailaModeration = new AilaModeration({
    aila,
    moderator,
    shouldPersist: forcePersistence,
    prisma: prismaMock,
    moderations,
  });

  const pluginContext = { aila, enqueue: jest.fn() };

  return {
    ailaModeration,
    pluginContext,
  };
};

describe("AilaModeration", () => {
  describe("moderate", () => {
    it("should respond with appropriate moderation categories based on the content of the chat", async () => {
      const moderationResult: ModerationResult = {
        categories: ["l/strong-language"],
        justification: "Test justification",
      };
      const moderator = new MockModerator([moderationResult]);

      const messages: Message[] = [
        { id: "1", role: "user", content: "test user message" },
        { id: "2", role: "assistant", content: "test assistant message" },
      ];
      const chat = {
        id: "123",
        userId: "456",
        messages,
      };
      const lessonPlan = {};

      const { ailaModeration, pluginContext } = setUpModeration({
        lessonPlan,
        chat,
        moderator,
      });

      const result = await ailaModeration.moderate({
        messages,
        lessonPlan,
        pluginContext,
      });

      expect(result).toEqual({
        type: "moderation",
        categories: moderationResult.categories,
        id: undefined, // Because we are not persisting
      });
    });

    it("should skip moderation when there are no user messages", async () => {
      const moderationResult: ModerationResult = {
        categories: ["l/strong-language"],
        justification: "Test justification",
      };
      const moderator = new MockModerator([moderationResult]);

      const messages: Message[] = [];
      const chat = {
        id: "123",
        userId: "456",
        messages,
      };
      const lessonPlan = {};

      const { ailaModeration, pluginContext } = setUpModeration({
        lessonPlan,
        chat,
        moderator,
      });

      const result = await ailaModeration.moderate({
        messages,
        lessonPlan,
        pluginContext,
      });

      expect(result).toEqual({
        type: "moderation",
        categories: [],
      });
    });

    it("should simulate a toxic input with a special code from the user", async () => {
      const specialCode = "mod:tox";

      const messages: Message[] = [
        { id: "1", role: "user", content: specialCode },
        { id: "2", role: "assistant", content: "test assistant message" },
      ];
      const chat = {
        id: "123",
        userId: "456",
        messages,
      };

      const lessonPlan = {};
      const { ailaModeration, pluginContext } = setUpModeration({
        lessonPlan,
        chat,
        moderator: new MockModerator([]),
      });

      const result = await ailaModeration.moderate({
        messages,
        lessonPlan,
        pluginContext,
      });

      expect(result).toEqual({
        type: "moderation",
        id: undefined, // We are not testing persistence
        categories: ["t/encouragement-violence"],
      });
    });

    it("calls any Aila plugins on a toxic moderation", async () => {
      const moderationResult: ModerationResult = {
        categories: ["t/encouragement-illegal-activity"],
        justification: "Test justification",
      };
      const moderator = new MockModerator([moderationResult]);

      const messages: Message[] = [
        { id: "1", role: "user", content: "test user message" },
        { id: "2", role: "assistant", content: "test assistant message" },
      ];
      const chat = {
        id: "123",
        userId: "456",
        messages,
      };
      const moderations = {
        create: jest.fn((mod) => ({ id: "ABC", ...mod })),
      } as unknown as Moderations;
      const mockPlugin = {
        onToxicModeration: jest.fn(() => {}),
      } as unknown as AilaPlugin;

      const lessonPlan = {};
      const { ailaModeration, pluginContext } = setUpModeration({
        lessonPlan,
        chat,
        moderator,
        // shouldPersist must be true to trigger the safety violation
        forcePersistence: true,
        // Therefore we need to stub moderations.create
        moderations,
        plugins: [mockPlugin],
      });

      const result = await ailaModeration.moderate({
        messages,
        lessonPlan,
        pluginContext,
      });

      expect(result).toEqual({
        type: "moderation",
        categories: moderationResult.categories,
        id: "ABC",
      });
      expect(mockPlugin.onToxicModeration).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: ["t/encouragement-illegal-activity"],
          justification: "Test justification",
        }),
        pluginContext,
      );
    });
  });
});
