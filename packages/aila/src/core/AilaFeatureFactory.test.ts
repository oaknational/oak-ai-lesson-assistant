import { AilaModeration } from "../features/moderation";
import { OakModerationServiceModerator } from "../features/moderation/moderators/OakModerationServiceModerator";
import {
  type OpenAILike,
  OpenAiModerator,
} from "../features/moderation/moderators/OpenAiModerator";
import { AilaFeatureFactory } from "./AilaFeatureFactory";
import type { AilaServices } from "./AilaServices";

const ORIGINAL_ENV = process.env;

function createAilaServices(): AilaServices {
  return {
    chatId: "chat-123",
    userId: "user-123",
    prisma: {},
    chat: {
      id: "chat-123",
      userId: "user-123",
    },
  } as AilaServices;
}

function createOpenAiClient(): OpenAILike {
  return {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  } as unknown as OpenAILike;
}

function getModerators(moderation: AilaModeration) {
  return moderation as unknown as {
    _moderator: unknown;
    _shadowModerator?: unknown;
  };
}

function getOakConfig(moderator: unknown) {
  return moderator as {
    config: {
      baseUrl: string;
      chatId: string;
      userId?: string;
      protectionBypassSecret?: string;
    };
  };
}

describe("AilaFeatureFactory.createModeration", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.OAK_MODERATION_V1_PRIMARY;
    delete process.env.MODERATION_API_URL;
    delete process.env.MODERATION_API_BYPASS_SECRET;
    delete process.env.MODERATION_SHADOW_ENABLED;
    delete process.env.MODERATION_SHADOW_API_URL;
    delete process.env.MODERATION_SHADOW_API_BYPASS_SECRET;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("keeps the Oak Moderation Service as primary when OAK_MODERATION_V1_PRIMARY is true", () => {
    process.env.OAK_MODERATION_V1_PRIMARY = "true";
    process.env.MODERATION_API_URL = "https://moderation.example";
    process.env.MODERATION_API_BYPASS_SECRET = "primary-secret";

    const moderation = AilaFeatureFactory.createModeration(
      createAilaServices(),
      { useModeration: true },
      createOpenAiClient(),
    );

    expect(moderation).toBeInstanceOf(AilaModeration);
    const { _moderator, _shadowModerator } = getModerators(
      moderation as AilaModeration,
    );
    expect(_moderator).toBeInstanceOf(OakModerationServiceModerator);
    expect(getOakConfig(_moderator).config).toMatchObject({
      baseUrl: "https://moderation.example",
      chatId: "chat-123",
      userId: "user-123",
      protectionBypassSecret: "primary-secret",
    });
    expect(_shadowModerator).toBeUndefined();
  });

  it("keeps OpenAI as primary when OAK_MODERATION_V1_PRIMARY is not true", () => {
    const moderation = AilaFeatureFactory.createModeration(
      createAilaServices(),
      { useModeration: true },
      createOpenAiClient(),
    );

    expect(moderation).toBeInstanceOf(AilaModeration);
    const { _moderator, _shadowModerator } = getModerators(
      moderation as AilaModeration,
    );
    expect(_moderator).toBeInstanceOf(OpenAiModerator);
    expect(_shadowModerator).toBeUndefined();
  });

  it("creates a candidate Oak shadow moderator only when enabled with a URL", () => {
    process.env.MODERATION_SHADOW_ENABLED = "true";
    process.env.MODERATION_SHADOW_API_URL = "https://candidate.example";
    process.env.MODERATION_SHADOW_API_BYPASS_SECRET = "shadow-secret";

    const moderation = AilaFeatureFactory.createModeration(
      createAilaServices(),
      { useModeration: true },
      createOpenAiClient(),
    );

    const { _moderator, _shadowModerator } = getModerators(
      moderation as AilaModeration,
    );
    expect(_moderator).toBeInstanceOf(OpenAiModerator);
    expect(_shadowModerator).toBeInstanceOf(OakModerationServiceModerator);
    expect(getOakConfig(_shadowModerator).config).toMatchObject({
      baseUrl: "https://candidate.example",
      chatId: "chat-123",
      userId: "user-123",
      protectionBypassSecret: "shadow-secret",
    });
  });

  it("does not create a shadow moderator when shadowing is enabled without a URL", () => {
    process.env.MODERATION_SHADOW_ENABLED = "true";

    const moderation = AilaFeatureFactory.createModeration(
      createAilaServices(),
      { useModeration: true },
      createOpenAiClient(),
    );

    const { _moderator, _shadowModerator } = getModerators(
      moderation as AilaModeration,
    );
    expect(_moderator).toBeInstanceOf(OpenAiModerator);
    expect(_shadowModerator).toBeUndefined();
  });

  it("can run an Oak primary and candidate Oak shadow independently", () => {
    process.env.OAK_MODERATION_V1_PRIMARY = "true";
    process.env.MODERATION_API_URL = "https://moderation.example";
    process.env.MODERATION_SHADOW_ENABLED = "true";
    process.env.MODERATION_SHADOW_API_URL = "https://candidate.example";

    const moderation = AilaFeatureFactory.createModeration(
      createAilaServices(),
      { useModeration: true },
    );

    const { _moderator, _shadowModerator } = getModerators(
      moderation as AilaModeration,
    );
    expect(_moderator).toBeInstanceOf(OakModerationServiceModerator);
    expect(_shadowModerator).toBeInstanceOf(OakModerationServiceModerator);
    expect(getOakConfig(_moderator).config.baseUrl).toBe(
      "https://moderation.example",
    );
    expect(getOakConfig(_shadowModerator).config.baseUrl).toBe(
      "https://candidate.example",
    );
  });
});
