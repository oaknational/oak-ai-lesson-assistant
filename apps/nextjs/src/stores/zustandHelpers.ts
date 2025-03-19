import { type LoggerKey, aiLogger } from "@oakai/logger";

import type { StoreApi } from "zustand";

export const logStoreUpdates = <T extends object>(
  store: StoreApi<T>,
  loggerKey: LoggerKey,
) => {
  const log = aiLogger(loggerKey);
  store.subscribe((state, prevState) => {
    const changedKeys = Object.keys(state)
      .filter((key) => state[key] !== prevState[key])
      .map((key) => {
        const value = state[key];
        if (value && typeof value === "object") {
          const prevValue = prevState[key] || {};
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const changedKeys = Object.keys(value).filter(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (key) => value[key] !== prevValue[key],
          );
          return `/${key}/{${changedKeys.join(",")}}`;
        }

        return `/${key}`;
      });
    // .map((key) => `/${key}`);
    log.info(`State updated: ${changedKeys.join(", ")}`);
  });
};
