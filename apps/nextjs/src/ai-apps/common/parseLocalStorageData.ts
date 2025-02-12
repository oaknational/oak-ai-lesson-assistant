import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import type { z } from "zod";

const log = aiLogger("ui");

export function parseLocalStorageData<S extends z.ZodTypeAny>(
  storageKey: string,
  schema: S,
): z.infer<S> | null {
  const storedData = localStorage.getItem(storageKey);

  log.info(
    "Attempting to parse localStorage key=%s data=%o",
    storageKey,
    storedData,
  );

  try {
    if (storedData) {
      const jsonParsedData = JSON.parse(storedData);
      const parsed = schema.parse(jsonParsedData);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return parsed;
    }
  } catch (err) {
    log.error(err);
    if (storedData !== "") {
      log.error("Failed to parse session from localStorage", storedData);
      Sentry.captureException(
        new Error("Failed to parse session from localStorage"),
        { extra: { originalError: err, storedData } },
      );
    }
    return null;
  }
}
