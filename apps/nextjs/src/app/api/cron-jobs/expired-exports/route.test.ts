import { prisma } from "@oakai/db";
import { googleDrive } from "@oakai/exports/src/gSuite/drive/client";

import * as Sentry from "@sentry/node";
import { NextRequest } from "next/server";

import { GET } from "./route";

jest.mock("@oakai/db", () => ({
  prisma: { lessonExport: { findFirst: jest.fn(), update: jest.fn() } },
}));
jest.mock("@oakai/exports/src/gSuite/drive/client", () => ({
  googleDrive: { files: { list: jest.fn(), delete: jest.fn() } },
}));
jest.mock("@sentry/node", () => ({ captureException: jest.fn() }));

// Drive methods have callback overloads; these mocks use the promise interface.
const list = googleDrive.files.list as jest.Mock;
const deleteFile = googleDrive.files.delete as jest.Mock;
const findFirst = prisma.lessonExport.findFirst as jest.Mock;
const update = prisma.lessonExport.update as jest.Mock;
const request = () =>
  new NextRequest("http://localhost/api/cron-jobs/expired-exports", {
    headers: { authorization: "Bearer test-secret" },
  });

describe("expired exports cleanup", () => {
  const originalSecret = process.env.CRON_SECRET;
  const originalFolder = process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID;

  beforeEach(() => {
    process.env.CRON_SECRET = "test-secret";
    process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID = "folder";
    list.mockResolvedValue({ data: { files: [] } });
    update.mockResolvedValue({ id: "export" });
    deleteFile.mockResolvedValue({});
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
    if (originalFolder === undefined)
      delete process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID;
    else process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID = originalFolder;
  });

  it("visits exports after an orphan page and lists before deleting", async () => {
    list
      .mockResolvedValueOnce({
        data: {
          files: [{ id: "orphan", ownedByMe: true }],
          nextPageToken: "next",
        },
      })
      .mockResolvedValueOnce({
        data: {
          files: [{ id: "valid", ownedByMe: true }],
        },
      });
    findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "export" });

    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      deletedCount: 1,
      orphanedCount: 1,
    });
    expect(list).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ pageToken: "next" }),
    );
    expect(deleteFile).toHaveBeenCalledTimes(1);
    expect(deleteFile).toHaveBeenCalledWith({
      fileId: "valid",
      supportsAllDrives: true,
    });
    expect(list.mock.invocationCallOrder[1]).toBeLessThan(
      deleteFile.mock.invocationCallOrder[0]!,
    );
  });

  it("continues after a page with no owned files", async () => {
    list
      .mockResolvedValueOnce({
        data: {
          files: [{ id: "unowned", ownedByMe: false }],
          nextPageToken: "next",
        },
      })
      .mockResolvedValueOnce({
        data: { files: [{ id: "orphan", ownedByMe: true }] },
      });
    findFirst.mockResolvedValue(null);
    const response = await GET(request());
    expect(await response.json()).toEqual({
      deletedCount: 0,
      orphanedCount: 1,
    });
    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it("does not query Prisma when there are no files", async () => {
    const response = await GET(request());
    expect(await response.json()).toEqual({
      deletedCount: 0,
      orphanedCount: 0,
    });
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("reports Drive listing failure instead of success", async () => {
    const error = new Error("Drive unavailable");
    list.mockRejectedValue(error);
    expect((await GET(request())).status).toBe(500);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("reports an incomplete scan when the page limit is reached", async () => {
    list.mockResolvedValue({ data: { files: [], nextPageToken: "more" } });
    expect((await GET(request())).status).toBe(500);
    expect(list).toHaveBeenCalledTimes(10);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("cleanup incomplete"),
      }),
    );
  });

  it("keeps database failures visible and does not delete the file", async () => {
    list.mockResolvedValue({
      data: { files: [{ id: "valid", ownedByMe: true }] },
    });
    findFirst.mockRejectedValue(new Error("Database unavailable"));
    expect((await GET(request())).status).toBe(500);
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it("rejects unauthorised requests before listing files", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/cron-jobs/expired-exports"),
    );
    expect(response.status).toBe(401);
    expect(list).not.toHaveBeenCalled();
  });
});
