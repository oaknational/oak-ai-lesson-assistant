import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

export const toxicModerationResultFixture: ModerationResult = {
  justification:
    "Content contains explicit encouragement of harmful behavior and includes discriminatory language targeting specific groups. The material promotes violence and includes toxic rhetoric that could influence vulnerable individuals.",
  scores: {
    l: 2,
    v: 1,
    u: 2,
    s: 4,
    p: 3,
    t: 5,
  },
  categories: ["t/encouragement-harmful-behaviour", "t/encouragement-violence"],
};

export const mockSensitiveResult: ModerationResult = {
  justification:
    "Content contains sensitive topics that may not be suitable for all audiences, including discussions of violence and self-harm. The material requires careful handling to ensure it is appropriate for educational use.",
  scores: {
    l: 1,
    v: 2,
    u: 4,
    s: 5,
    p: 3,
    t: 2,
  },
  categories: ["u/sensitive-content"],
};

export function getMockModerationResult(
  title: string,
): ModerationResult | null {
  if (title.includes("mod:tox")) {
    return toxicModerationResultFixture;
  }

  if (title.includes("mod:sen")) {
    return mockSensitiveResult;
  }

  return null;
}
