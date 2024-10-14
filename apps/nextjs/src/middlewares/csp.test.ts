import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

import { addCspHeaders, CspConfig } from "./csp";

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

function writePoliciesToFile(env: Environment, policies: string) {
  const filePath = path.join(
    __dirname,
    "test",
    "snapshots",
    `policies.${env}.test.txt`,
  );
  fs.writeFileSync(filePath, policies);
}

function readPoliciesFromFile(env: Environment): string {
  const filePath = path.join(
    __dirname,
    "test",
    "snapshots",
    `policies.${env}.test.txt`,
  );
  return fs.readFileSync(filePath, "utf-8");
}

const mockedCrypto = {
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => "mocked-nonce"),
  })),
};

// Mock the global require function
const originalRequire = jest.requireActual<NodeRequire>("module");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).require = Object.assign(
  jest.fn((moduleName: string) => {
    if (moduleName === "crypto") {
      return mockedCrypto;
    }
    return originalRequire(moduleName);
  }),
  {
    resolve: originalRequire.resolve,
    cache: originalRequire.cache,
    extensions: originalRequire.extensions,
    main: originalRequire.main,
  },
);

// Mock the global crypto object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).crypto = {
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = i % 256; // Fill with predictable values
    }
    return array;
  }),
  subtle: {},
  randomUUID: jest.fn(() => "mocked-uuid"),
};

describe("CSP Policies Snapshot", () => {
  const regenerateSnapshots = process.env.REGENERATE_SNAPSHOTS === "true";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).require = originalRequire;
  });

  environments.forEach((env) => {
    it(`should match ${env} environment snapshot`, () => {
      const generatedPolicies = generatePoliciesForEnvironment(env);

      if (regenerateSnapshots) {
        writePoliciesToFile(env, generatedPolicies);
        console.log(`Regenerated snapshot for ${env} environment`);
      } else {
        const savedPolicies = readPoliciesFromFile(env);
        expect(generatedPolicies).toBe(savedPolicies);
      }
    });
  });
});
