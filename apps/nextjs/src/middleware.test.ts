import { NextRequest, NextFetchEvent, NextResponse } from "next/server";

import { handleError } from "./middleware";
import { CspConfig, addCspHeaders, buildCspHeaders } from "./middlewares/csp";

describe("handleError", () => {
  let mockRequest: NextRequest;
  let mockEvent: NextFetchEvent;

  beforeEach(() => {
    mockRequest = {
      url: "https://example.com",
      method: "GET",
      headers: new Headers(),
      cookies: new Map(),
      geo: {},
      ip: "127.0.0.1",
      nextUrl: { pathname: "/", search: "" },
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue(""),
    } as unknown as NextRequest;

    mockEvent = {
      sourcePage: "/test",
    } as NextFetchEvent;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("handles SyntaxError correctly", async () => {
    const error = new SyntaxError("Test syntax error");
    const response = await handleError(error, mockRequest, mockEvent);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Bad Request" });
  });

  it("handles wrapped SyntaxError correctly", async () => {
    const error = new Error("Wrapper error");
    error.cause = new SyntaxError("Test syntax error");
    const response = await handleError(error, mockRequest, mockEvent);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Bad Request" });
  });

  it("handles other errors correctly", async () => {
    const error = new Error("Test error");
    const response = await handleError(error, mockRequest, mockEvent);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal Server Error" });
  });
});

describe("addCspHeaders", () => {
  let mockRequest: NextRequest;
  let mockResponse: NextResponse;
  let defaultConfig: CspConfig;

  beforeEach(() => {
    mockRequest = new NextRequest("https://example.com", {
      method: "GET",
      headers: new Headers(),
    });

    mockResponse = new NextResponse();

    defaultConfig = {
      strictCsp: true,
      environment: "production",
      sentryEnv: "test",
      sentryRelease: "1.0.0",
      sentryReportUri: "https://sentry.io/report",
      cspReportSampleRate: "1",
      vercelEnv: "production",
      enabledPolicies: {
        clerk: false,
        avo: false,
        posthog: false,
        devConsent: false,
        mux: true,
        vercel: false,
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("adds CSP headers to the response", () => {
    const result = addCspHeaders(mockResponse, mockRequest, defaultConfig);

    expect(result.headers.has("Content-Security-Policy")).toBe(true);
    expect(result.headers.get("x-middleware-csp-nonce")).toBeTruthy();
  });

  it("does not add CSP headers for _next/static paths", () => {
    mockRequest = new NextRequest("https://example.com/_next/static/chunk.js", {
      method: "GET",
      headers: new Headers(),
    });

    const result = addCspHeaders(mockResponse, mockRequest, defaultConfig);

    expect(result.headers.has("Content-Security-Policy")).toBe(false);
    expect(result.headers.has("x-middleware-csp-nonce")).toBe(false);
  });

  it("does not add CSP headers for next-router-prefetch requests", () => {
    mockRequest = new NextRequest("https://example.com", {
      method: "GET",
      headers: new Headers({ "next-router-prefetch": "1" }),
    });

    const result = addCspHeaders(mockResponse, mockRequest, defaultConfig);

    expect(result.headers.has("Content-Security-Policy")).toBe(false);
    expect(result.headers.has("x-middleware-csp-nonce")).toBe(false);
  });

  it("adds CSP-Report-Only header when strictCsp is false", () => {
    const config = { ...defaultConfig, strictCsp: false };
    const result = addCspHeaders(mockResponse, mockRequest, config);

    expect(result.headers.has("Content-Security-Policy-Report-Only")).toBe(
      true,
    );
  });

  it("does not add CSP-Report-Only header when strictCsp is true", () => {
    const result = addCspHeaders(mockResponse, mockRequest, defaultConfig);

    expect(result.headers.has("Content-Security-Policy-Report-Only")).toBe(
      false,
    );
  });

  it("includes Clerk policies when enabled", () => {
    const config = {
      ...defaultConfig,
      enabledPolicies: { ...defaultConfig.enabledPolicies, clerk: true },
    };
    const result = addCspHeaders(mockResponse, mockRequest, config);

    const cspHeader = result.headers.get("Content-Security-Policy");
    expect(cspHeader).toContain("*.clerk.accounts.dev");
  });

  it("includes development-specific directives when environment is development", () => {
    const config = { ...defaultConfig, environment: "development" };
    const result = addCspHeaders(mockResponse, mockRequest, config);

    const cspHeader = result.headers.get("Content-Security-Policy");
    expect(cspHeader).toContain("'unsafe-eval'");
    expect(cspHeader).not.toContain("upgrade-insecure-requests");
  });

  it("includes all Mux policies when enabled", () => {
    const config = {
      ...defaultConfig,
      enabledPolicies: { ...defaultConfig.enabledPolicies, mux: true },
    };
    const result = addCspHeaders(mockResponse, mockRequest, config);

    const cspHeader = result.headers.get("Content-Security-Policy");
    expect(cspHeader).toContain("https://cdn.mux.com");
    expect(cspHeader).toContain("https://stream.mux.com");
    expect(cspHeader).toContain("https://inferred.litix.io");
  });

  it("includes all required policies", () => {
    const result = addCspHeaders(mockResponse, mockRequest, defaultConfig);
    const cspHeader = result.headers.get("Content-Security-Policy");

    // Check for base policies
    expect(cspHeader).toContain("default-src 'self'");
    expect(cspHeader).toContain("script-src 'self'");
    expect(cspHeader).toContain("style-src 'self' 'unsafe-inline'");

    // Check for specific domains
    expect(cspHeader).toContain("*.thenational.academy");
    expect(cspHeader).toContain("*.hubspot.com");
    expect(cspHeader).toContain("https://img.clerk.com");
    expect(cspHeader).toContain("https://res.cloudinary.com");
  });

  it("includes Clerk policies when enabled", () => {
    const config = {
      ...defaultConfig,
      enabledPolicies: { ...defaultConfig.enabledPolicies, clerk: true },
    };
    const result = addCspHeaders(mockResponse, mockRequest, config);

    const cspHeader = result.headers.get("Content-Security-Policy");
    expect(cspHeader).toContain("*.clerk.accounts.dev");
  });

  it("includes Vercel policies when enabled", () => {
    const config = {
      ...defaultConfig,
      enabledPolicies: { ...defaultConfig.enabledPolicies, vercel: true },
    };
    const result = addCspHeaders(mockResponse, mockRequest, config);

    const cspHeader = result.headers.get("Content-Security-Policy");
    expect(cspHeader).toContain("https://vercel.live/");
    expect(cspHeader).toContain("https://vercel.com");
    expect(cspHeader).toContain("*.pusher.com");
  });
});

describe("buildCspHeaders", () => {
  const mockNonce = "test-nonce";
  const mockConfig: CspConfig = {
    strictCsp: true,
    environment: "production",
    sentryEnv: "test",
    sentryRelease: "1.0.0",
    sentryReportUri: "https://sentry.io/report",
    cspReportSampleRate: "1",
    vercelEnv: "production",
    enabledPolicies: {
      clerk: false,
      avo: false,
      posthog: false,
      devConsent: false,
      mux: true,
      vercel: false,
    },
  };

  it("generates correct CSP headers", () => {
    const result = buildCspHeaders(mockNonce, mockConfig);

    expect(result.policy).toContain(`'nonce-${mockNonce}'`);
    expect(result.policy).toContain("upgrade-insecure-requests");

    expect(result.policy).toContain("default-src 'self'");
    expect(result.policy).toContain("script-src 'self'");
    expect(result.policy).toContain("style-src 'self' 'unsafe-inline'");

    if (mockConfig.enabledPolicies.mux) {
      expect(result.policy).toContain("https://cdn.mux.com");
    }
    if (mockConfig.enabledPolicies.clerk) {
      expect(result.policy).toContain("*.clerk.accounts.dev");
    }
  });

  it("generates report-only CSP when strictCsp is false", () => {
    const nonStrictConfig = { ...mockConfig, strictCsp: false };
    const result = buildCspHeaders(mockNonce, nonStrictConfig);

    expect(result.policy).toContain("frame-ancestors 'self'");
    expect(result.reportOnly).toBeDefined();
    expect(result.reportOnly).toContain("default-src 'self'");
  });
});
