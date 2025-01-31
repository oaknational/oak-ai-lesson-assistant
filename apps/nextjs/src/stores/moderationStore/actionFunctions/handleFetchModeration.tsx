import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import * as Sentry from "@sentry/nextjs";

import { trpcClient } from "@/utils/trpcClient";

import type { ModerationStore } from "..";

export const handleFetchModerations = async (
  set: (state: Pick<ModerationStore, "isModerationsLoading">) => void,
  get: () => ModerationStore,
) => {
  const { updateModerationState, id } = get();

  if (!id) {
    return;
  }
  set({
    isModerationsLoading: true,
  });
  try {
    const fetchedModerations =
      await trpcClient.chat.appSessions.getModerations.query({
        id,
      });
    updateModerationState([...fetchedModerations]);
  } catch (error) {
    Sentry.captureException(error);
  } finally {
    set({
      isModerationsLoading: false,
    });
  }
};
