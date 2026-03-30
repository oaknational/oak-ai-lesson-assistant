import {
  ModelArmorClient,
  createWorkloadIdentityAccessTokenProvider,
} from "../ModelArmorClient";

describe("ModelArmorClient", () => {
  let mockFetch: jest.SpyInstance;
  let mockGetAccessToken: jest.Mock<Promise<string>, []>;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, "fetch");
    mockGetAccessToken = jest.fn().mockResolvedValue("test-access-token");
  });

  afterEach(() => {
    mockFetch.mockRestore();
    jest.clearAllMocks();
  });

  it("creates a client with an injected access token provider", () => {
    const client = new ModelArmorClient({
      defaultTemplateId: "template-1",
      getAccessToken: mockGetAccessToken,
      projectId: "test-project",
      location: "europe-west4",
    });

    expect(client).toBeInstanceOf(ModelArmorClient);
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
        { status: 200 },
      ),
    );

    const client = new ModelArmorClient({
      defaultTemplateId: "template-1",
      getAccessToken: mockGetAccessToken,
      projectId: "test-project",
      location: "europe-west4",
    });

    const result = await client.sanitizeUserPrompt("user: hello");

    expect(result.sanitizationResult.filterResults?.pi_and_jailbreak).toEqual({
      piAndJailbreakFilterResult: {
        matchState: "NO_MATCH_FOUND",
      },
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://modelarmor.europe-west4.rep.googleapis.com/v1/projects/test-project/locations/europe-west4/templates/template-1:sanitizeUserPrompt",
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
      defaultTemplateId: "template-1",
      getAccessToken: mockGetAccessToken,
      projectId: "test-project",
      location: "europe-west4",
    });

    await expect(client.sanitizeUserPrompt("user: hello")).rejects.toThrow(
      "Model Armor request failed: 403 Forbidden",
    );
  });
});

describe("createWorkloadIdentityAccessTokenProvider", () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    mockFetch.mockRestore();
    jest.clearAllMocks();
  });

  it("exchanges a subject token for an access token", async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "sts-access-token",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: "impersonated-access-token",
          }),
          { status: 200 },
        ),
      );

    const getAccessToken = createWorkloadIdentityAccessTokenProvider({
      getSubjectToken: async () => "subject-token",
      projectNumber: "123456789",
      serviceAccountEmail: "svc@example.iam.gserviceaccount.com",
      workloadIdentityPoolId: "pool-id",
      workloadIdentityPoolProviderId: "provider-id",
    });

    await expect(getAccessToken()).resolves.toBe("impersonated-access-token");
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://sts.googleapis.com/v1/token",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/svc@example.iam.gserviceaccount.com:generateAccessToken",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
