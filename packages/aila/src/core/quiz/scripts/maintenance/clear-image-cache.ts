#!/usr/bin/env tsx

/**
 * Clear cached image descriptions from Redis
 *
 * Usage (from packages/aila directory):
 *   pnpm with-env tsx src/core/quiz/scripts/clear-image-cache.ts
 *
 * This will delete all cached image descriptions with the prefix: quiz:image-description:
 */
import { aiLogger } from "@oakai/logger";

import { kv } from "@vercel/kv";

const log = aiLogger("aila:quiz");

const CACHE_PREFIX = "quiz:image-description:";

async function clearImageCache() {
  log.info("\n========================================");
  log.info("Clear Image Description Cache");
  log.info("========================================\n");

  log.info(`Scanning for keys with prefix: ${CACHE_PREFIX}*\n`);

  try {
    // Scan for all keys with the prefix
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await kv.scan(cursor, {
        match: `${CACHE_PREFIX}*`,
        count: 100,
      });

      cursor = result[0];
      const foundKeys = result[1] as string[];
      keys.push(...foundKeys);

      log.info(`Found ${foundKeys.length} keys (cursor: ${cursor})`);
    } while (cursor !== 0);

    if (keys.length === 0) {
      log.info("\nNo cached image descriptions found.");
      return;
    }

    log.info(`\nTotal keys found: ${keys.length}`);
    log.info("\nDeleting...");

    // Delete in batches
    const batchSize = 100;
    let deleted = 0;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await Promise.all(batch.map((key) => kv.del(key)));
      deleted += batch.length;
      log.info(`Deleted ${deleted}/${keys.length} keys`);
    }

    log.info("\n========================================");
    log.info(`✓ Successfully deleted ${deleted} cached image descriptions`);
    log.info("========================================\n");
  } catch (error) {
    log.error("Failed to clear cache:", error);
    process.exit(1);
  }
}

clearImageCache().catch((error) => {
  log.error("Script failed:", error);
  process.exit(1);
});
