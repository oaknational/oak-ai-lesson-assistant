import type { Moderation } from "@prisma/client";

import type { ModerationGetter, ModerationSetter } from "../types";
import { handleUpdateModerationState } from "./handleUpdateModerationState";

function moderation(id: string, categories: string[]): Moderation {
  return {
    id,
    categories,
    messageId: id,
    userId: "user-id",
    appSessionId: "chat-id",
    scores: null,
    justification: null,
    lessonSnapshotId: null,
    userComment: null,
    invalidatedAt: null,
    invalidatedBy: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("handleUpdateModerationState", () => {
  test("uses the newest fetched moderation as lastModeration and locks on the locking moderation", () => {
    const set = jest.fn() as unknown as ModerationSetter;
    const updateLockingModeration = jest.fn();
    const get = jest.fn(() => ({
      actions: { updateLockingModeration },
    })) as unknown as ModerationGetter;
    const olderLockingModeration = moderation("older-locking", [
      "t/encouragement-violence",
    ]);
    const newestModeration = moderation("newest", ["p/external-content"]);

    handleUpdateModerationState(
      set,
      get,
    )([olderLockingModeration, newestModeration]);

    expect(set).toHaveBeenCalledWith({
      moderations: [olderLockingModeration, newestModeration],
      lastModeration: newestModeration,
    });
    expect(updateLockingModeration).toHaveBeenCalledWith(
      olderLockingModeration,
    );
  });
});
