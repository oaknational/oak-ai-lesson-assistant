import type { Dispatch, SetStateAction } from "react";

import { containsLink } from "@/utils/link-validation";

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
    setDialogWindow("teaching-materials-threat-detected");
    return;
  }

  if (error) {
    switch (error.type) {
      case "banned":
        window.location.href = "/legal/account-locked";
        break;
      case "rate_limit":
        setDialogWindow("teaching-materials-rate-limit");
        break;
      case "copyright":
      case "toxic":
        break; // this is now handled by TeachingMaterialsLockingModerationModal, first step in removing dialog modals for TM.
      case "restrictedContentGuidance":
      default:
        setDialogWindow("teaching-materials-error");
        break;
    }
  }
};

export const getValidationError = (
  titleToCheck: string | null | undefined,
  yearToCheck: string | null | undefined,
  subjectToCheck: string | null | undefined,
  docTypeName: string | null,
): string => {
  if (!titleToCheck && !subjectToCheck && !yearToCheck) {
    return `Please provide a year group, subject and lesson details, so that Aila has the right context for your ${docTypeName}.`;
  } else if (!yearToCheck && !subjectToCheck) {
    return `Please select a year group and subject, so that Aila has the right context for your ${docTypeName}.`;
  } else if (!yearToCheck) {
    return `Please select a year group, so that Aila has the right context for your ${docTypeName}.`;
  } else if (!subjectToCheck) {
    return `Please select a subject, so that Aila has the right context for your ${docTypeName}.`;
  } else if (!titleToCheck) {
    return `Please provide your lesson details, so that Aila has the right context for your ${docTypeName}.`;
  } else if (containsLink(titleToCheck)) {
    return "Aila doesn't currently support links";
  } else if (titleToCheck.length < 4) {
    return `Please provide a longer lesson title.`;
  }

  return "";
};

export const validateForm = (
  titleToCheck: string | null | undefined,
  yearToCheck: string | null | undefined,
  subjectToCheck: string | null | undefined,
  docTypeName: string | null,
) => {
  const errorMessage = getValidationError(
    titleToCheck,
    yearToCheck,
    subjectToCheck,
    docTypeName,
  );

  return {
    isValid: errorMessage === "",
    errorMessage,
  };
};
