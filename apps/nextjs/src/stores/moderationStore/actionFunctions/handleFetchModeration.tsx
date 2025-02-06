import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";

import type { TrpcUtils } from "@/utils/trpc";

import type { ModerationStore } from "..";

const log = aiLogger("moderation:store");

export const handleFetchModerations = async (
  set: (state: Pick<ModerationStore, "isModerationsLoading">) => void,
  get: () => ModerationStore,
  trpcUtils: TrpcUtils,
) => {
  const { updateModerationState, id } = get();

  set({
    isModerationsLoading: true,
  });
  try {
    const fetchedModerations =
      await trpcUtils.chat.appSessions.getModerations.fetch({
        id,
      });
    updateModerationState(fetchedModerations);
  } catch (error) {
    log.error("Error fetching moderation", error);
    Sentry.captureException(error);
  } finally {
    set({
      isModerationsLoading: false,
    });
  }
};
