import { ExternalAccountClient } from "google-auth-library";

import { ModelArmorClient } from "../ModelArmorClient";

jest.mock("google-auth-library", () => ({
  ExternalAccountClient: {
    fromJSON: jest.fn(),
  },
}));

describe("ModelArmorClient", () => {
  let mockFetch: jest.SpyInstance;
  let mockGetAccessToken: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, "fetch");
    mockGetAccessToken = jest
      .fn()
      .mockResolvedValue({ token: "test-access-token" });

    (ExternalAccountClient.fromJSON as jest.Mock).mockReturnValue({
      getAccessToken: mockGetAccessToken,
    });
  });

  afterEach(() => {
    mockFetch.mockRestore();
    jest.clearAllMocks();
  });

  it("creates an auth client from external account credentials", () => {
    const client = new ModelArmorClient({
      credentialsJson: JSON.stringify({
        type: "external_account",
        audience: "//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/pool/providers/provider",
      }),
      projectId: "test-project",
      location: "europe-west4",
      templateId: "template-1",
    });

    expect(client).toBeInstanceOf(ModelArmorClient);
    expect(ExternalAccountClient.fromJSON).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "external_account",
      }),
    );
  });

  it("sends an authenticated sanitizeUserPrompt request", async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          sanitizationResult: {
            filterMatchState: "NO_MATCH_FOUND",
            filterResults: {
              pi_and_jailbreak: {
                piAndJailbreakFilterResult: {
                  matchState: "NO_MATCH_FOUND",
                },
              },
            },
            invocationResult: "SUCCESS",
          },
        }),
        {
          status: 200,
          headers: {
            "x-request-id": "request-123",
          },
        },
      ),
    );

    const client = new ModelArmorClient({
      credentialsJson: JSON.stringify({
        type: "external_account",
        audience: "audience",
      }),
      projectId: "test-project",
      location: "europe-west4",
      templateId: "template-1",
    });

    const result = await client.sanitizeUserPrompt("user: hello");

    expect(result.requestId).toBe("request-123");
    expect(result.sanitizationResult.filterResults.piAndJailbreak).toEqual({
      piAndJailbreakFilterResult: {
        matchState: "NO_MATCH_FOUND",
      },
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://modelarmor.googleapis.com/v1/projects/test-project/locations/europe-west4/templates/template-1:sanitizeUserPrompt",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-access-token",
        },
      }),
    );
  });

  it("throws on non-2xx responses", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "denied" }), {
        status: 403,
        statusText: "Forbidden",
      }),
    );

    const client = new ModelArmorClient({
      credentialsJson: JSON.stringify({
        type: "external_account",
        audience: "audience",
      }),
      projectId: "test-project",
      location: "europe-west4",
      templateId: "template-1",
    });

    await expect(client.sanitizeUserPrompt("user: hello")).rejects.toThrow(
      "Model Armor API error: 403 Forbidden",
    );
  });

  it("throws when the response schema is invalid", async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          invalid: true,
        }),
        {
          status: 200,
        },
      ),
    );

    const client = new ModelArmorClient({
      credentialsJson: JSON.stringify({
        type: "external_account",
        audience: "audience",
      }),
      projectId: "test-project",
      location: "europe-west4",
      templateId: "template-1",
    });

    await expect(client.sanitizeUserPrompt("user: hello")).rejects.toThrow();
  });
});
