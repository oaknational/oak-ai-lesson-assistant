import type { Dispatch, SetStateAction } from "react";

import type { DialogTypes } from "../../Chat/Chat/types";

export const handleDialogSelection = ({
  threatDetected,
  error,
  setDialogWindow,
}: {
  threatDetected: boolean | undefined;
  error: { type: string } | null;
  setDialogWindow: Dispatch<SetStateAction<DialogTypes>>;
}) => {
  if (threatDetected) {
    setDialogWindow("additional-materials-threat-detected");
    return;
  }

  if (error) {
    if (error.type === "banned") {
      setDialogWindow("additional-materials-user-account-locked");
    } else if (error.type === "rate_limit") {
      setDialogWindow("additional-materials-rate-limit");
    }
  }
};
