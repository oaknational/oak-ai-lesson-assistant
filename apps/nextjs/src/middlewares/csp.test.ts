import { NextRequest } from "next/server";

import { addCspHeaders, CspConfig } from "./csp";

// Mock the uuid module
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

const environments = ["development", "production", "preview"] as const;
type Environment = (typeof environments)[number];

function generatePoliciesForEnvironment(env: Environment): string {
  const mockRequest = new NextRequest("https://example.com");
  const mockResponse = new Response();

  const config: CspConfig = {
    strictCsp: true,
    environment: env,
    sentryEnv: "test",
    sentryRelease: "1.0.0",
    sentryReportUri: "https://sentry.io/report",
    cspReportSampleRate: "1",
    vercelEnv: env === "preview" ? "preview" : "production",
    enabledPolicies: {
      clerk: env !== "production",
      avo: env !== "production",
      posthog: env === "development",
      devConsent: env === "development",
      mux: true,
      vercel: env === "preview",
    },
  };

  const result = addCspHeaders(mockResponse, mockRequest, config);
  const cspHeader = result.headers.get("Content-Security-Policy") || "";
  return cspHeader
    .split(";")
    .map((policy) => policy.trim())
    .join("\n");
}

describe("CSP Policies Snapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  environments.forEach((env) => {
    it(`should match ${env} environment snapshot`, () => {
      const generatedPolicies = generatePoliciesForEnvironment(env);
      expect(generatedPolicies).toMatchSnapshot();
    });
  });
});
