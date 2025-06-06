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
    switch (error.type) {
      case "banned":
        window.location.href = "/legal/account-locked";
        break;
      case "rate_limit":
        setDialogWindow("additional-materials-rate-limit");
        break;
      case "toxic":
        setDialogWindow("additional-materials-toxic-moderation");
        break;
      default:
        setDialogWindow("additional-materials-error");
        break;
    }
  }
};
