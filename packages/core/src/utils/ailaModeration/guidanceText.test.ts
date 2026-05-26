import { moderationGuidanceText } from "./guidanceText";
import type { ModerationBase } from "./moderationSchema";

const mod = (categories: string[]): ModerationBase => ({ categories });

describe("moderationGuidanceText", () => {
  it("returns longMessage for a single Oak Service category", () => {
    expect(moderationGuidanceText(mod(["u/violence-or-suffering"]))).toBe(
      "This lesson contains violence or suffering (e.g., war, famine, disasters, or animal cruelty). Some pupils may find this distressing. Please check this content carefully.",
    );
  });

  it("returns semicolon-separated shortDescriptions for multiple categories", () => {
    expect(
      moderationGuidanceText(
        mod(["u/violence-or-suffering", "l/discriminatory-language"]),
      ),
    ).toBe(
      "This lesson has been flagged for: Violence or suffering; Discriminatory behaviour or language. Please review the content carefully and ensure it is age-appropriate and aligned with your school's policies.",
    );
  });

  it("falls back to userDescription for legacy v0 categories", () => {
    expect(moderationGuidanceText(mod(["l/strong-language"]))).toBe(
      "Contains strong language. Check content carefully.",
    );
  });
});
