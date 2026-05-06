import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { moderateWithOakService } from "@oakai/core/src/utils/ailaModeration/oakModerationService";

import { OakModerationServiceModerator } from "./OakModerationServiceModerator";

jest.mock("@oakai/core/src/utils/ailaModeration/oakModerationService", () => ({
  OakModerationServiceError: class OakModerationServiceError extends Error {},
  moderateWithOakService: jest.fn(),
}));

jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

const mockedModerateWithOakService = jest.mocked(moderateWithOakService);

describe("OakModerationServiceModerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retries once when the Oak Moderation Service call fails", async () => {
    const result: ModerationResult = {
      categories: [],
    };
    mockedModerateWithOakService
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce(result);

    const moderator = new OakModerationServiceModerator({
      baseUrl: "https://moderation.test",
      chatId: "chat-1",
      userId: "user-1",
    });

    await expect(moderator.moderate("content")).resolves.toBe(result);
    expect(mockedModerateWithOakService).toHaveBeenCalledTimes(2);
  });
});
