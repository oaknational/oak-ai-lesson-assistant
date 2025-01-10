const GENERATIONS_PER_24H = parseInt(
  process.env.RATELIMIT_GENERATIONS_PER_24H ?? "120",
  10,
);

export const personaNames = [
  "typical",
  "demo",
  "nearly-banned",
  "nearly-rate-limited",
  "sharing-chat",
  "modify-lesson-plan",
  "needs-onboarding",
  "needs-demo-status",
] as const;

export type PersonaName = (typeof personaNames)[number];
export type Persona = {
  isOnboarded: boolean;
  isDemoUser: boolean | null;
  region: "GB" | "US";
  chatFixture: "typical" | null;
  safetyViolations: number;
  rateLimitTokens: number;
};

export const personas: Record<PersonaName, Persona> = {
  // A user with no issues and a completed lesson plan
  typical: {
    isOnboarded: true,
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  // A user from a demo region
  demo: {
    isOnboarded: true,
    isDemoUser: true,
    region: "US",
    chatFixture: null,
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  // A user with 3 safety violations - will be banned with one more
  "nearly-banned": {
    isOnboarded: true,
    isDemoUser: false,
    region: "GB",
    chatFixture: null,
    safetyViolations: 3,
    rateLimitTokens: 0,
  },
  // A user with 119 of their 120 generations remaining
  "nearly-rate-limited": {
    isOnboarded: true,
    isDemoUser: false,
    region: "GB",
    chatFixture: null,
    safetyViolations: 0,
    rateLimitTokens: GENERATIONS_PER_24H - 1,
  },
  // Allows `chat.isShared` to be set/reset without leaking between tests/retries
  "sharing-chat": {
    isOnboarded: true,
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  "modify-lesson-plan": {
    isOnboarded: true,
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  "needs-onboarding": {
    isOnboarded: false,
    isDemoUser: false,
    region: "GB",
    chatFixture: null,
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  "needs-demo-status": {
    isOnboarded: true,
    isDemoUser: null,
    region: "GB",
    chatFixture: null,
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
} as const;
