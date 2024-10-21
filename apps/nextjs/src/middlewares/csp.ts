import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

function generateNonce(): string {
  return uuidv4();
}

export type CspEnvironment = "development" | "preview" | "production" | "test";
export type VercelEnvironment = "development" | "preview" | "production";
export interface CspConfig {
  strictCsp: boolean;
  environment: CspEnvironment;
  sentryEnv: string;
  sentryRelease: string;
  sentryReportUri: string;
  cspReportSampleRate: string;
  vercelEnv: VercelEnvironment;
  enabledPolicies: {
    clerk: boolean;
    avo: boolean;
    posthog: boolean;
    devConsent: boolean;
    mux: boolean;
    vercel: boolean;
    localhost: boolean;
  };
}

const getReportUri = (config: CspConfig) => {
  const rate = Number.parseFloat(config.cspReportSampleRate);
  if (config.environment === "production" && Math.random() > rate) {
    return "";
  }
  return `${config.sentryReportUri}&sentry_environment=${config.sentryEnv}&sentry_release=${config.sentryRelease}`;
};

const clerkPolicies: Record<string, string[]> = {
  "connect-src": ["*.clerk.accounts.dev"],
};

const avoPolicies: Record<string, string[]> = {
  "frame-src": ["https://www.avo.app/"],
  "connect-src": ["https://api.avo.app/"],
};

const posthogPolicies: Record<string, string[]> = {
  "connect-src": ["https://eu.i.posthog.com"],
};

const devConsentPolicies: Record<string, string[]> = {
  "connect-src": [
    "https://europe-west2-oak-ai-beta-staging.cloudfunctions.net",
  ],
};

const mux: Record<string, string[]> = {
  "script-src": [
    "https://cdn.mux.com",
    "https://mux.com",
    "https://*.mux.com",
    "https://stream.mux.com",
  ],
  "connect-src": [
    "https://mux.com",
    "https://*.mux.com",
    "https://stream.mux.com",
    "https://inferred.litix.io",
  ],
  "img-src": ["https://*.mux.com", "https://stream.mux.com"],
  "style-src": ["https://*.mux.com"],
  "media-src": [
    "'self'",
    "https://*.mux.com",
    "https://stream.mux.com",
    "blob:",
  ],
  "frame-src": ["https://stream.mux.com"],
};

const vercelPolicies: Record<string, string[]> = {
  "script-src": ["https://vercel.live", "https://vercel.com"],
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
};

const addUpgradeInsecure = (csp: string, config: CspConfig) => {
  if (config.environment === "development") {
    return csp;
  }
  return `${csp}; upgrade-insecure-requests`;
};

export const buildCspHeaders = (nonce: string, config: CspConfig) => {
  const legacyCspHeader = `frame-ancestors 'self';script-src-next-nonce 'nonce-${nonce}'`;

  const baseCsp = {
    "default-src": ["'self'"],
    "media-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      ["test", "dev"].includes(config.environment) ? "" : "'strict-dynamic'",
      "https:",
      "http:",
      "'unsafe-inline'",
      config.environment === "production" ? "" : "'unsafe-eval'",
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
    "report-uri": [getReportUri(config)],
  };

  const cspString = Object.entries(baseCsp)
    .map(([policy, baseValue]) => {
      const value = [...baseValue];

      const additionalPolicies = [
        config.enabledPolicies.vercel ? vercelPolicies : {},
        config.enabledPolicies.clerk ? clerkPolicies : {},
        config.enabledPolicies.avo ? avoPolicies : {},
        config.enabledPolicies.posthog ? posthogPolicies : {},
        config.enabledPolicies.devConsent ? devConsentPolicies : {},
        config.enabledPolicies.mux ? mux : {},
        config.enabledPolicies.localhost
          ? {
              "script-src": ["http://localhost:*"],
              "frame-ancestors": ["http://localhost:*"],
            }
          : {},
      ];

      for (const policyObject of additionalPolicies) {
        const policyValue = policyObject[policy as keyof typeof policyObject];
        if (Array.isArray(policyValue)) {
          value.push(...policyValue);
        }
      }

      return `${policy} ${value.join(" ")}`;
    })
    .join(";");

  if (config.strictCsp) {
    return {
      policy: addUpgradeInsecure(cspString, config),
    };
  } else {
    return {
      policy: addUpgradeInsecure(legacyCspHeader, config),
      reportOnly: cspString,
    };
  }
};

const OVERRIDE_HEADERS = "x-middleware-override-headers";
const MIDDLEWARE_HEADER_PREFIX = "x-middleware-request" as string;

const setRequestHeadersOnNextResponse = (
  res: NextResponse | Response,
  req: Request,
  newHeaders: Record<string, string>,
) => {
  if (!res.headers.get(OVERRIDE_HEADERS)) {
    res.headers.set(OVERRIDE_HEADERS, Array.from(req.headers.keys()).join(","));
    req.headers.forEach((val, key) => {
      res.headers.set(`${MIDDLEWARE_HEADER_PREFIX}-${key}`, val);
    });
  }

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
  config: CspConfig,
): Response => {
  if (
    request.nextUrl.pathname.match(
      /(_next\/static|_next\/image|favicon.ico)/,
    ) ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("purpose")
  ) {
    return response;
  }

  const nonce = generateNonce();
  const csp = buildCspHeaders(nonce, config);
  const newResponse = new NextResponse(response.body, response);

  newResponse.headers.set("x-middleware-csp-nonce", nonce);

  setRequestHeadersOnNextResponse(newResponse, request, {
    "x-nonce": nonce,
    "Content-Security-Policy": csp.policy,
    ...(csp.reportOnly && {
      "Content-Security-Policy-Report-Only": csp.reportOnly,
    }),
  });

  newResponse.headers.set("Content-Security-Policy", csp.policy);
  if (csp.reportOnly) {
    newResponse.headers.set(
      "Content-Security-Policy-Report-Only",
      csp.reportOnly,
    );
  }

  return newResponse;
};
