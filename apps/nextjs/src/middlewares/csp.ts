import { NextRequest, NextResponse } from "next/server";

const sentryEnv = process.env.NEXT_PUBLIC_SENTRY_ENV;
const sentryRelease = process.env.NEXT_PUBLIC_APP_VERSION;
const sentryReportUri = `${process.env.SENTRY_REPORT_URI}&sentry_environment=${sentryEnv}&sentry_release=${sentryRelease}`;

const getReportUri = (): string => {
  const rate = Number.parseFloat(
    process.env.NEXT_PUBLIC_CSP_REPORT_SAMPLE_RATE || "1",
  );
  if (sentryEnv === "production" && Math.random() > rate) {
    return "";
  }
  return sentryReportUri;
};

const buildCspHeaders = (nonce: string): { policy: string } => {
  const baseCsp = {
    "default-src": ["'self'"],
    "media-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https:",
      "http:",
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "connect-src": ["'self'", "*.thenational.academy", "*.hubspot.com"],
    "worker-src": ["'self'", "blob:"],
    "img-src": [
      "'self'",
      "blob:",
      "data:",
      "https://img.clerk.com",
      "https://res.cloudinary.com",
      "https://*.hubspot.com",
      "https://*.hsforms.com",
    ],
    "font-src": [
      "'self'",
      "gstatic-fonts.thenational.academy",
      "fonts.gstatic.com",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-src": [
      "'self'",
      "*.thenational.academy",
      "https://challenges.cloudflare.com",
      "https://*.mux.com",
    ],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
    "report-uri": [getReportUri()],
  };

  const cspString = Object.keys(baseCsp)
    .map((policy) => {
      const value = baseCsp[policy].join(" ");
      return `${policy} ${value}`;
    })
    .join("; ");

  return { policy: cspString };
};

const setRequestHeadersOnNextResponse = (
  res: NextResponse | Response,
  req: NextRequest,
  newHeaders: Record<string, string>,
) => {
  if (!res.headers.get("x-middleware-override-headers")) {
    req.headers.forEach((val, key) => {
      res.headers.set(`x-middleware-request-${key}`, val);
    });
  }

  Object.entries(newHeaders).forEach(([key, val]) => {
    res.headers.set(key, val);
  });
};

export const addCspHeaders = (
  response: Response,
  request: NextRequest,
): Response => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCspHeaders(nonce);

  response.headers.set("x-middleware-csp-nonce", nonce);
  response.headers.set("Content-Security-Policy", csp.policy);

  setRequestHeadersOnNextResponse(response, request, {
    "x-nonce": nonce,
  });

  return response;
};
