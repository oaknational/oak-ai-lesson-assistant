import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { oakModerationServiceCodes } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import { AilaModerator } from "./AilaModerator";

const log = aiLogger("aila:moderation");

/**
 * Mock Oak Moderation Service moderator for local development.
 * Returns all-safe v1 scores (every category = 5).
 *
 * Used when OIDC auth is unavailable (outside Vercel runtime).
 * Mock test codes (mod:tox, mod:sen, mod:cat:) are handled upstream
 * in AilaModeration before this moderator is called.
 */
export class MockOakModerationServiceModerator extends AilaModerator {
  constructor({ userId, chatId }: { userId?: string; chatId?: string }) {
    super({ userId, chatId });
  }

  async moderate(_input: string): Promise<ModerationResult> {
    log.warn("Using mock Oak Moderation Service (no OIDC available)");

    const scores = Object.fromEntries(
      oakModerationServiceCodes.map((code) => [code, 5]),
    ) as Record<(typeof oakModerationServiceCodes)[number], number>;

    return { scores, categories: [] };
  }
}
