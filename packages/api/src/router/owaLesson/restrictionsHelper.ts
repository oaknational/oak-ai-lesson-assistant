import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

import type { LessonContentSchema } from "./schemas";

const log = aiLogger("additional-materials");

const RESTRICTED_CONTENT_GUIDANCE_TYPES = [
  "Depiction or discussion of sexual violence",
  "Depiction or discussion of sexual content",
  "Depiction or discussion of mental health issues",
  "Depiction or discussion of serious crime",
] as const;

export function checkForRestrictedContentGuidance(
  content: LessonContentSchema["content_guidance"],
): void {
  if (content === null) {
    return;
  }

  const contentGuidanceLabels = content.map((item) => ({
    contentGuidanceLabel: item.contentguidance_label ?? "",
  }));

  const hasRestrictedContent = contentGuidanceLabels.some((item) =>
    RESTRICTED_CONTENT_GUIDANCE_TYPES.includes(
      item.contentGuidanceLabel as (typeof RESTRICTED_CONTENT_GUIDANCE_TYPES)[number],
    ),
  );

  if (hasRestrictedContent) {
    log.error("Restricted content guidance detected", {
      contentGuidanceLabels,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "content-guidance: This lesson contains restricted content-guidance themes and cannot be exported.",
    });
  }
}
