import { useEffect } from "react";

import { useModerationStore } from "@/stores/AilaStoresProvider";
import { trpc } from "@/utils/trpc";

export const ModerationSync = ({ id }: { id: string }) => {
  const {
    data: moderations,
    isLoading: isModerationsLoading,
    refetch: refetchModerations,
  } = trpc.chat.appSessions.getModerations.useQuery(
    { id },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  );

  const setModeration = useModerationStore(
    (state) => state.updateModerationState,
  );
  const setIsModerationsLoading = useModerationStore(
    (state) => state.setIsModerationsLoading,
  );

  useEffect(() => {
    setIsModerationsLoading(isModerationsLoading);
  }, [isModerationsLoading, setIsModerationsLoading]);

  useEffect(() => {
    if (moderations !== undefined) {
      console.log("moderations IN SYNC", moderations);
      setModeration(moderations || []);
    }
  }, [moderations, setModeration]);

  useEffect(() => {
    void refetchModerations();
  }, [refetchModerations]);
  return null;
};
