export function convertTitleCaseToSentenceCase(titleCase: string) {
  const lowerCaseTitle = titleCase.toLowerCase();
  return lowerCaseTitle.charAt(0).toUpperCase() + lowerCaseTitle.slice(1);
}
