import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

export const toxicModerationResultFixture: ModerationResult = {
  justification:
    "Content contains explicit encouragement of harmful behavior and includes discriminatory language targeting specific groups. The material promotes violence and includes toxic rhetoric that could influence vulnerable individuals.",
  scores: {
    l1: 2, l2: 5,
    u1: 2, u2: 1, u3: 5, u4: 5, u5: 5,
    s1: 4,
    p2: 3, p3: 5, p4: 5, p5: 5,
    e1: 5,
    r1: 5, r2: 5,
    n1: 5, n2: 5, n3: 5, n4: 5, n5: 5, n6: 5, n7: 5,
    t1: 5, t2: 1, t3: 5, t4: 1, t5: 5, t6: 5,
  },
  categories: ["l1", "u1", "u2", "s1", "p2", "t2", "t4"],
};

export const mockSensitiveResult: ModerationResult = {
  justification:
    "Content contains sensitive topics that may not be suitable for all audiences, including discussions of violence and self-harm. The material requires careful handling to ensure it is appropriate for educational use.",
  scores: {
    l1: 1, l2: 5,
    u1: 4, u2: 2, u3: 5, u4: 5, u5: 5,
    s1: 5,
    p2: 3, p3: 5, p4: 5, p5: 5,
    e1: 5,
    r1: 5, r2: 5,
    n1: 5, n2: 5, n3: 5, n4: 5, n5: 5, n6: 5, n7: 5,
    t1: 2, t2: 5, t3: 5, t4: 5, t5: 5, t6: 5,
  },
  categories: ["l1", "u1", "u2", "p2", "t1"],
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
