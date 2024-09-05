import { NextRequest, NextResponse } from "next/server";

const sentryEnv = process.env.NEXT_PUBLIC_SENTRY_ENV;
const sentryRelease = process.env.NEXT_PUBLIC_APP_VERSION;
const sentryReportUri = `${process.env.SENTRY_REPORT_URI}&sentry_environment=${sentryEnv}&sentry_release=${sentryRelease}`;

const getReportUri = () => {
  const rate = Number.parseFloat(
    process.env.NEXT_PUBLIC_CSP_REPORT_SAMPLE_RATE || "1",
  );
  if (sentryEnv === "production" && Math.random() > rate) {
    return "";
  }
  return sentryReportUri;
};

const clerkPolicies =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ||
  process.env.NEXT_PUBLIC_ENVIRONMENT === "stg"
    ? {
        "connect-src": ["*.clerk.accounts.dev"],
      }
    : {};

const avoPolicies =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ||
  process.env.NEXT_PUBLIC_ENVIRONMENT === "stg"
    ? {
        // lets us use avo's debugger in dev
        "frame-src": ["https://www.avo.app/"],
        "connect-src": ["https://api.avo.app/"],
      }
    : {};

const posthogPolicies =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
    ? {
        "connect-src": ["https://eu.i.posthog.com"],
      }
    : {};

const devConsentPolicies =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
    ? {
        /* our consent deployment for dev doesn't live behind thenational.academy,
        so we need to allow the specific cloud functions URL */
        "connect-src": [
          "https://europe-west2-oak-ai-beta-staging.cloudfunctions.net",
        ],
      }
    : {};

const mux = {
  "script-src": ["https://cdn.mux.com", "https://mux.com", "https://*.mux.com"],
  "connect-src": ["https://mux.com", "https://*.mux.com"],
  "img-src": ["https://*.mux.com"],
  "style-src": ["https://*.mux.com"],
  "media-src": ["https://*.mux.com"],
};

const vercelPolicies =
  process.env.VERCEL_ENV === "preview"
    ? {
        "script-src": ["https://vercel.live/", "https://vercel.com"],
        "connect-src": [
          "https://vercel.live/",
          "https://vercel.com",
          "*.pusher.com",
          "*.pusherapp.com",
        ],
        "img-src": [
          "https://vercel.live/",
          "https://vercel.com",
          "*.pusher.com/",
          "data:",
          "blob:",
        ],
        "frame-src": ["https://vercel.live/", "https://vercel.com"],
        "style-src": ["https://vercel.live/"],
        "font-src": ["https://vercel.live/", "https://assets.vercel.com"],
      }
    : {};

const buildCspHeaders = (nonce: string) => {
  const legacyCspHeader = `upgrade-insecure-requests; frame-ancestors 'self';script-src-next-nonce 'nonce-${nonce}'`;

  const baseCsp = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https:",
      "http:",
      "'unsafe-inline'", // NOTE: unsafe-inline is ignored in browser that support nonce
      process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'",
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
      // Oak font subdomain
      "gstatic-fonts.thenational.academy",
      // Google fonts used by third party tools
      "fonts.gstatic.com",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-src": [
      "'self'",
      "*.thenational.academy",
      "https://challenges.cloudflare.com",
    ],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
    "report-uri": [getReportUri()],
  };

  const cspString = Object.keys(baseCsp)
    .map((policy) => {
      const value = [...baseCsp[policy]];

      if (vercelPolicies[policy]) {
        value.push(...vercelPolicies[policy]);
      }
      if (clerkPolicies[policy]) {
        value.push(...clerkPolicies[policy]);
      }
      if (avoPolicies[policy]) {
        value.push(...avoPolicies[policy]);
      }
      if (posthogPolicies[policy]) {
        value.push(...posthogPolicies[policy]);
      }
      if (devConsentPolicies[policy]) {
        value.push(...devConsentPolicies[policy]);
      }
      if (mux[policy]) {
        value.push(...mux[policy]);
      }
      return `${policy} ${value.join(" ")}`;
    })
    .join(";");

  if (process.env.STRICT_CSP === "true") {
    return {
      policy: cspString,
    };
  } else {
    return {
      policy: legacyCspHeader,
      reportOnly: cspString.replace("upgrade-insecure-requests ;", ""),
    };
  }
};

const OVERRIDE_HEADERS = "x-middleware-override-headers";
const MIDDLEWARE_HEADER_PREFIX = "x-middleware-request" as string;

// The nextjs CSP example passes request headers to the NextResponse.next() constructor
// We already have a NextResponse, so we need to replicate that behaviour
// See https://github.com/vercel/next.js/blob/918af1667aa0770088446952bc607b9a972e6128/packages/next/src/server/web/spec-extension/response.ts#L21-L27
// Implementation copied from https://github.com/clerk/javascript/blob/c489ee1c95596af2e39636f02ee748e74011ce19/packages/nextjs/src/server/utils.ts#L80
const setRequestHeadersOnNextResponse = (
  res: NextResponse | Response,
  req: Request,
  newHeaders: Record<string, string>,
) => {
  if (!res.headers.get(OVERRIDE_HEADERS)) {
    // Emulate a user setting overrides by explicitly adding the required nextjs headers
    // https://github.com/vercel/next.js/pull/41380
    // @ts-expect-error Argument of type 'string[]' is not assignable to parameter of type 'string'.ts(2345)
    res.headers.set(OVERRIDE_HEADERS, [...req.headers.keys()]);
    req.headers.forEach((val, key) => {
      res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
    });
  }

  // Now that we have normalised res to include overrides, just append the new header
  Object.entries(newHeaders).forEach(([key, val]) => {
    res.headers.set(
      OVERRIDE_HEADERS,
      `${res.headers.get(OVERRIDE_HEADERS)},${key}`,
    );
    res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
  });
};

export const addCspHeaders = (
  response: Response,
  request: NextRequest,
): Response => {
  if (
    request.nextUrl.pathname.match(
      // NOTE: We're keeping CSP headers for /api routes in case they return an HTML response like 404
      /(_next\/static|_next\/image|favicon.ico)/,
    ) ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("purpose")
  ) {
    return response;
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCspHeaders(nonce);

  const headers = new Headers(response.headers);
  headers.set("x-middleware-csp-nonce", nonce);

  setRequestHeadersOnNextResponse(response, request, {
    "x-nonce": nonce,
    "Content-Security-Policy": csp.policy,
    ...(csp.reportOnly && {
      "Content-Security-Policy-Report-Only": csp.reportOnly,
    }),
  });

  response.headers.set("Content-Security-Policy", csp.policy);
  if (csp.reportOnly) {
    response.headers.set("Content-Security-Policy-Report-Only", csp.reportOnly);
  }

  return response;
};
