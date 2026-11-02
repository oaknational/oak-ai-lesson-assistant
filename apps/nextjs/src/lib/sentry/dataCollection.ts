import type * as Sentry from "@sentry/nextjs";

type DataCollection = NonNullable<Sentry.BrowserOptions["dataCollection"]>;

// Matched anywhere in a header or query parameter name. These carry IP
// addresses and locations (x-forwarded-for, x-real-ip, x-vercel-ip-city), or
// cookies and email addresses. Sentry also always filters names containing
// auth, token, session, key and similar
const personalDataKeyFragments = [
  "forwarded",
  "-ip",
  "remote-",
  "via",
  "-user",
  "cookie",
  "email",
];

/**
 * Left unset, Sentry 11 collects user IP addresses, cookies, unfiltered
 * headers, request and response bodies, AI prompts and outputs, database
 * query data and local variable values. Teachers' messages and lesson content
 * can contain personal data, so collect none of it. The user ID is still set
 * explicitly by SentryIdentify
 */
export const sentryDataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: personalDataKeyFragments },
    response: { deny: personalDataKeyFragments },
  },
  httpBodies: [],
  urlQueryParams: { deny: personalDataKeyFragments },
  genAI: { inputs: false, outputs: false },
  mcp: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
  stackFrameVariables: false,
};
