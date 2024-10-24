// To re-generate the snapshots run:
// pnpm --filter @oakai/nextjs test -- -u src/middlewares/csp.test.ts
import { NextRequest } from "next/server";

import { addCspHeaders, CspConfig, CspEnvironment } from "./csp";

const environments = ["development", "production", "preview", "test"] as const;

function generatePoliciesForEnvironment(env: CspEnvironment): string {
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
      localhost: env === "development",
    },
  };

  const result = addCspHeaders(mockResponse, mockRequest, config);
  const cspHeader = result.headers.get("Content-Security-Policy") || "";

  const sanitizedCspHeader = cspHeader.replace(
    /'nonce-[^']+'/g,
    "'nonce-REPLACED_NONCE'",
  );

  return sanitizedCspHeader
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
