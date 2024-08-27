import browserLogger from "@oakai/logger/browser";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

export function parseLocalStorageData<S extends z.ZodTypeAny>(
  storageKey: string,
  schema: S,
): z.infer<S> | null {
  const storedData = localStorage.getItem(storageKey);

  browserLogger.debug(
    "Attempting to parse localStorage key=%s data=%o",
    storageKey,
    storedData,
  );

  try {
    if (storedData) {
      const jsonParsedData = JSON.parse(storedData);
      return schema.parse(jsonParsedData);
    }
  } catch (err) {
    browserLogger.error(err);
    if (storedData !== "") {
      console.error("Failed to parse session from localStorage", storedData);
      Sentry.captureException(
        new Error("Failed to parse session from localStorage"),
        { extra: { originalError: err, storedData } },
      );
    }
    return null;
  }
}
