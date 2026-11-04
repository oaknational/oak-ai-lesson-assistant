import { useCallback } from "react";

import { useSession } from "@clerk/nextjs";
import { ClerkOfflineError } from "@clerk/nextjs/errors";

export const useReloadSession = () => {
  const { session } = useSession();

  return useCallback(async () => {
    try {
      await session?.getToken({ skipCache: true });
    } catch (error) {
      // v7's getToken throws when offline (v6 returned null); swallow it so callers still resolve as before
      if (!ClerkOfflineError.is(error)) {
        throw error;
      }
    }
  }, [session]);
};
