import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

const allSafeScores = {
  "l/discriminatory-language": 5,
  "l/offensive-language": 5,
  "u/sensitive-content": 5,
  "u/violence-or-suffering": 5,
  "u/mental-health-challenges": 5,
  "u/crime-or-illegal-activities": 5,
  "u/sexual-violence": 5,
  "s/nudity-or-sexual-content": 5,
  "p/practical-activities": 5,
  "p/outdoor-learning": 5,
  "p/additional-qualifications": 5,
  "r/recent-content": 5,
  "r/recent-conflicts": 5,
  "n/self-harm-suicide": 5,
  "n/potentially-offensive-language": 5,
  "n/strangulation-suffocation": 5,
  "t/guides-self-harm-suicide": 5,
  "t/encourages-harmful-behaviour": 5,
  "t/encourages-illegal-activity": 5,
  "t/encourages-violence-harm-others": 5,
  "t/using-creating-weapons": 5,
  "t/using-creating-harmful-substances": 5,
  "t/extreme-offensive-language": 5,
  "e/rshe-content": 5,
} as const;

export const oakModerationFixtures = {
  clean: {
    categories: [],
    scores: allSafeScores,
  } satisfies ModerationResult,

  guidance: {
    categories: ["u/sensitive-content"],
    scores: { ...allSafeScores, "u/sensitive-content": 3 },
  } satisfies ModerationResult,

  toxic: {
    categories: ["t/encourages-violence-harm-others"],
    scores: { ...allSafeScores, "t/encourages-violence-harm-others": 1 },
  } satisfies ModerationResult,

  "highly-sensitive": {
    categories: ["n/self-harm-suicide"],
    scores: { ...allSafeScores, "n/self-harm-suicide": 2 },
  } satisfies ModerationResult,
} as const;

export type OakModerationFixtureName = keyof typeof oakModerationFixtures;
