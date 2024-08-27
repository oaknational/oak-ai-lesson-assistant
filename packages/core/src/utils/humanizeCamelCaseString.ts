export function humanizeCamelCaseString(str: string) {
  return str.replace(/([A-Z0-9])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
}
