import { useCallback, useEffect, useState } from "react";

import browserLogger from "@oakai/logger/browser";

import { trpc } from "@/utils/trpc";

type baseState = {
  sessionId: string | null;
};

const useShareContent = <T extends baseState>({
  state,
}: Readonly<{ state: T }>) => {
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const shareContentTrpc = trpc.app.takeShareSnapshot.useMutation({
    retry: 1,
  });
  const shareContent = useCallback(async () => {
    try {
      if (state.sessionId) {
        setShareLoading(true);
        const shareContentMutationResult = await shareContentTrpc.mutateAsync({
          sessionId: state.sessionId,
        });

        if (shareContentMutationResult) {
          setShareId(shareContentMutationResult);
          setShareLoading(false);
        } else {
          browserLogger.error("Failed to write shared data to db");
          setShareId(null);
          setShareLoading(false);
        }
      }
    } catch (error) {
      browserLogger.error(error, "Failed to share content");
      setShareLoading(false);
    }
  }, [shareContentTrpc, state.sessionId]);

  useEffect(() => {
    if (state) {
      setShareId("");
    }
  }, [state]);

  return { shareContent, shareId, shareLoading };
};

export default useShareContent;
