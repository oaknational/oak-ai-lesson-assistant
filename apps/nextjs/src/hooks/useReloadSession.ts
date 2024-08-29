import { useCallback } from "react";

import { useSession } from "@clerk/nextjs";

export const useReloadSession = () => {
  const { session } = useSession();

  return useCallback(async () => {
    await session?.getToken({ skipCache: true });
  }, [session]);
};
