export function camelCaseToSentenceCase(str: string) {
  return str
    .replace(/([A-Z0-9])/g, " $1") // Insert a space before each uppercase letter or digit
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/(?<=\s)[A-Z]/g, (str) => str.toLowerCase());
}
