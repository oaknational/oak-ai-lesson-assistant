import { useEffect } from "react";

import { useChatStore } from "..";

// The chat store is instantiated globally, so can leak state between pages
// Use this hook to reset the store when changing page
// NOTE: If this causes problems, we can try instantiating the store in a context
export const useChatStoreReset = ({ id }: { id: string | null }) => {
  const reset = useChatStore((state) => state.reset);

  useEffect(() => {
    reset(id);
    return () => {
      reset(null);
    };
  }, [id, reset]);
};
