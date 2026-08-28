import { aiLogger } from "@oakai/logger";

import { z } from "zod";

const log = aiLogger("feature-flags");

export const STATUS_BANNER_FLAG = "aila-status-banner";

/**
 * The text is split either side of the link so it reads as one sentence:
 * `messageBefore` then the link then `messageAfter`. We link real words rather than
 * a bare URL, which screen readers read out one character at a time.
 */
export const statusBannerPayloadSchema = z.object({
  messageBefore: z.string().min(1),
  linkText: z.string().min(1),
  href: z.string().url(),
  messageAfter: z.string().default(""),
});

export type StatusBannerPayload = z.infer<typeof statusBannerPayloadSchema>;

/**
 * Shown when the flag is on but its payload is missing or broken.
 *
 * Someone will be editing that payload in a hurry while an incident is live, so a
 * typo should still leave users with a warning rather than no banner at all.
 */
export const DEFAULT_STATUS_BANNER_PAYLOAD: StatusBannerPayload = {
  messageBefore: "We're currently experiencing some issues, see",
  linkText: "our status page",
  href: "https://status.thenational.academy/",
  messageAfter: "for more information.",
};

export function parseStatusBannerPayload(value: unknown): StatusBannerPayload {
  if (value === undefined || value === null) {
    return DEFAULT_STATUS_BANNER_PAYLOAD;
  }

  const parsed = statusBannerPayloadSchema.safeParse(value);

  if (!parsed.success) {
    log.error(
      `Invalid ${STATUS_BANNER_FLAG} payload, falling back to the default message`,
      parsed.error.flatten(),
    );
    return DEFAULT_STATUS_BANNER_PAYLOAD;
  }

  return parsed.data;
}
