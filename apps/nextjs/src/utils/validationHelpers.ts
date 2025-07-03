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
