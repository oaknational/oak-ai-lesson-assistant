import { useEffect } from "react";

import type { Moderation } from "@prisma/client";

import { useModerationStore } from "./index";

export const useModerationStoreMirror = (
  moderation: Moderation[] | undefined,
) => {
  const setModeration = useModerationStore(
    (state) => state.updateModerationState,
  );

  useEffect(() => {
    if (moderation) {
      setModeration(moderation);
    }
  }, [moderation, setModeration]);
};
