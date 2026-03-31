import {
  moderateWithOakService,
  OakModerationServiceError,
} from "./oakModerationService";

// Mock openapi-fetch — replaces the real HTTP client factory
const mockPost = jest.fn();
jest.mock("openapi-fetch", () => ({
  __esModule: true,
  default: () => ({ POST: mockPost }),
}));

// Mock Vercel OIDC — simulates no token available (local/test environment)
jest.mock("@vercel/oidc", () => ({
  getVercelOidcToken: jest.fn().mockRejectedValue(new Error("no token")),
}));

jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));

const baseConfig = { baseUrl: "https://moderation.test" };

describe("moderateWithOakService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns categories and scores on success", async () => {
    mockPost.mockResolvedValue({
      data: {
        flagged_categories: ["u/sensitive-content"],
        scores: { "u/sensitive-content": 3 },
        moderation_id: "mod-1",
        prompt_version: "v1",
      },
      error: undefined,
      response: { status: 200 },
    });

    const result = await moderateWithOakService("test content", baseConfig);

    expect(result.categories).toEqual(["u/sensitive-content"]);
    expect(result.scores).toEqual({ "u/sensitive-content": 3 });
  });

  it("returns empty categories for safe content", async () => {
    mockPost.mockResolvedValue({
      data: {
        flagged_categories: [],
        scores: {},
        moderation_id: "mod-2",
        prompt_version: "v1",
      },
      error: undefined,
      response: { status: 200 },
    });

    const result = await moderateWithOakService("safe content", baseConfig);

    expect(result.categories).toEqual([]);
  });

  it("throws OakModerationServiceError on 401", async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { error: "Unauthorized" },
      response: { status: 401 },
    });

    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow(OakModerationServiceError);
    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow("Authentication failed");
  });

  it("throws OakModerationServiceError on 403", async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { error: "Forbidden" },
      response: { status: 403 },
    });

    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow("Project not authorized");
  });

  it("throws on generic API errors", async () => {
    mockPost.mockResolvedValue({
      data: undefined,
      error: { error: "Internal Server Error" },
      response: { status: 500 },
    });

    await expect(
      moderateWithOakService("test", baseConfig),
    ).rejects.toThrow("Oak Moderation Service returned 500");
  });

  it("passes protectionBypassSecret as header", async () => {
    mockPost.mockResolvedValue({
      data: {
        flagged_categories: [],
        scores: {},
        moderation_id: "mod-3",
        prompt_version: "v1",
      },
      error: undefined,
      response: { status: 200 },
    });

    await moderateWithOakService("test", {
      ...baseConfig,
      protectionBypassSecret: "secret-123",
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
