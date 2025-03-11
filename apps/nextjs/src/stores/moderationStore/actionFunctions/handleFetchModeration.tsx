import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { ModerationGetter, ModerationSetter } from "../types";

const log = aiLogger("moderation:store");

export const handleFetchModerations = (
  set: ModerationSetter,
  get: ModerationGetter,
  trpcUtils: TrpcUtils,
) => {
  return async () => {
    const { actions, id } = get();

    set({
      isModerationsLoading: true,
    });
    try {
      const fetchedModerations =
        await trpcUtils.chat.appSessions.getModerations.fetch({
          id,
        });
      actions.updateModerationState(fetchedModerations);
    } catch (error) {
      log.error("Error fetching moderation", error);
      Sentry.captureException(error);
    } finally {
      set({
        isModerationsLoading: false,
      });
    }
  };
};
