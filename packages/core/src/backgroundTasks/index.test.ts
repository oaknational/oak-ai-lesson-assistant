import * as Sentry from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";

import { notifyRateLimit } from "../functions/slack/notifyRateLimit";
import { notifyUserBan } from "../functions/slack/notifyUserBan";
import {
  scheduleRateLimitNotification,
  scheduleUserBanNotification,
} from "./index";

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

jest.mock("@vercel/functions", () => ({
  waitUntil: jest.fn(),
}));

jest.mock("../functions/slack/notifyRateLimit", () => ({
  notifyRateLimit: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../functions/slack/notifyModeration", () => ({
  notifyModeration: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../functions/slack/notifyModerationTeachingMaterials", () => ({
  notifyModerationTeachingMaterials: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../functions/slack/notifyThreatDetectionAila", () => ({
  notifyThreatDetectionAila: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../functions/slack/notifyThreatDetectionTeachingMaterials", () => ({
  notifyThreatDetectionTeachingMaterials: jest
    .fn()
    .mockResolvedValue(undefined),
}));

jest.mock("../functions/slack/notifyUserBan", () => ({
  notifyUserBan: jest.fn().mockResolvedValue(undefined),
}));

describe("background tasks", () => {
  const originalJestWorkerId = process.env.JEST_WORKER_ID;

  afterEach(() => {
    process.env.JEST_WORKER_ID = originalJestWorkerId;
    jest.clearAllMocks();
  });

  it("captures invalid input without rejecting the caller", async () => {
    await expect(
      scheduleRateLimitNotification({
        user: { id: "user-123" },
        data: {
          limit: "bad-data",
          reset: new Date("2026-04-07T12:00:00.000Z"),
        },
      } as never),
    ).resolves.toBeUndefined();

    expect(waitUntil).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it("uses waitUntil outside Jest", async () => {
    delete process.env.JEST_WORKER_ID;

    await scheduleRateLimitNotification({
      user: { id: "user-123" },
      data: {
        limit: 5,
        reset: new Date("2026-04-07T12:00:00.000Z"),
      },
    });

    expect(waitUntil).toHaveBeenCalledTimes(1);
  });

  it("runs handlers inline in Jest", async () => {
    process.env.JEST_WORKER_ID = "1";

    await scheduleUserBanNotification({
      user: { id: "user-123" },
      data: {},
    });

    expect(notifyUserBan).toHaveBeenCalledWith({
      user: { id: "user-123" },
      data: {},
    });
    expect(waitUntil).not.toHaveBeenCalled();
  });

  it("passes validated input to the handler", async () => {
    process.env.JEST_WORKER_ID = "1";

    await scheduleRateLimitNotification({
      user: { id: "user-123" },
      data: {
        limit: 5,
        reset: new Date("2026-04-07T12:00:00.000Z"),
      },
    });

    expect(notifyRateLimit).toHaveBeenCalledWith({
      user: { id: "user-123" },
      data: {
        limit: 5,
        reset: new Date("2026-04-07T12:00:00.000Z"),
      },
    });
  });

  it("captures handler failures without rejecting the caller", async () => {
    process.env.JEST_WORKER_ID = "1";
    (notifyUserBan as jest.Mock).mockRejectedValueOnce(
      new Error("slack failed"),
    );

    await expect(
      scheduleUserBanNotification({
        user: { id: "user-123" },
        data: {},
      }),
    ).resolves.toBeUndefined();

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
