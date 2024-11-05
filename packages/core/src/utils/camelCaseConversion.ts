export function camelCaseToSentenceCase(str: string) {
  return str
    .replace(/([A-Z0-9])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\s[A-Z]/g, (str) => str.toLowerCase());
}

export function camelCaseToTitleCase(str: string) {
  return str
    .replace(/([A-Z0-9])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\s./g, (str) => str.toUpperCase());
}
