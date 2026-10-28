import { getVercelOidcToken } from "@vercel/oidc";

import { createDetectionServiceClient } from "../DetectionServiceClient";

jest.mock("@vercel/oidc", () => ({
  getVercelOidcToken: jest.fn(),
}));

const mockGetVercelOidcToken = jest.mocked(getVercelOidcToken);

const SAFE_RESPONSE = {
  provider: "model_armor",
  is_threat: false,
  message: "No threats detected",
  findings: [],
};

const THREAT_RESPONSE = {
  provider: "model_armor",
  is_threat: true,
  severity: "critical",
  category: "system_prompt_override",
  message: "Potential threat detected",
  findings: [
    {
      category: "system_prompt_override",
      severity: "critical",
      provider_code: "pi_and_jailbreak",
      detected: true,
      confidence: 0.9,
      metadata: { confidenceLevel: "HIGH" },
    },
  ],
  details: { detected_elements: ["pi_and_jailbreak"] },
  detection_id: "6f1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
};

type FetchInit = { headers: Record<string, string>; body: string };

function mockFetchOnce(body: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200;
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

/** The arguments the detector passed to fetch, typed so assertions are safe. */
function lastFetchCall(): [string, FetchInit] {
  const calls = (global.fetch as jest.Mock).mock.calls as [string, FetchInit][];
  const call = calls[0];
  if (!call) {
    throw new Error("fetch was not called");
  }
  return call;
}

const PROMPT = "Hello";

describe("DetectionServiceClient", () => {
  beforeEach(() => {
    process.env.THREAT_DETECTION_API_URL = "https://detection.test";
    delete process.env.THREAT_DETECTION_API_BYPASS_SECRET;
    jest.clearAllMocks();
    mockGetVercelOidcToken.mockResolvedValue("test-oidc-token");
  });

  it("maps a threat response into Aila's shape", async () => {
    mockFetchOnce(THREAT_RESPONSE);

    const result = await createDetectionServiceClient().detect(PROMPT);

    expect(result.isThreat).toBe(true);
    expect(result.category).toBe("system_prompt_override");
    expect(result.requestId).toBe(THREAT_RESPONSE.detection_id);
    expect(result.findings[0]).toMatchObject({
      providerCode: "pi_and_jailbreak",
      detected: true,
      confidence: 0.9,
    });
    expect(result.details?.detectedElements).toEqual(["pi_and_jailbreak"]);
  });

  it("maps a safe response", async () => {
    mockFetchOnce(SAFE_RESPONSE);

    const result = await createDetectionServiceClient().detect(PROMPT);

    expect(result.isThreat).toBe(false);
    expect(result.findings).toEqual([]);
  });

  it("sends the OIDC token as a bearer credential", async () => {
    mockFetchOnce(SAFE_RESPONSE);

    await createDetectionServiceClient().detect(PROMPT);

    const [url, init] = lastFetchCall();
    expect(url).toBe("https://detection.test/v1/detect");
    expect(init.headers.Authorization).toBe("Bearer test-oidc-token");
  });

  it("omits the bypass header when no secret is configured", async () => {
    mockFetchOnce(SAFE_RESPONSE);

    await createDetectionServiceClient().detect(PROMPT);

    const [, init] = lastFetchCall();
    expect(init.headers["x-vercel-protection-bypass"]).toBeUndefined();
  });

  it("sends the bypass header when one is configured", async () => {
    process.env.THREAT_DETECTION_API_BYPASS_SECRET = "bypass-secret";
    mockFetchOnce(SAFE_RESPONSE);

    await createDetectionServiceClient().detect(PROMPT);

    const [, init] = lastFetchCall();
    expect(init.headers["x-vercel-protection-bypass"]).toBe("bypass-secret");
  });

  it("throws on a non-200, so the turn fails closed", async () => {
    mockFetchOnce({ error: "Forbidden" }, { status: 403 });

    await expect(createDetectionServiceClient().detect(PROMPT)).rejects.toThrow(
      /403/,
    );
  });

  it("throws on a response it cannot parse, rather than guessing", async () => {
    mockFetchOnce({ provider: "model_armor", message: "no verdict field" });

    await expect(
      createDetectionServiceClient().detect(PROMPT),
    ).rejects.toThrow();
  });

  it("throws when no base URL is configured, rather than calling nothing", () => {
    delete process.env.THREAT_DETECTION_API_URL;

    expect(() => createDetectionServiceClient()).toThrow(
      /THREAT_DETECTION_API_URL/,
    );
  });
});
