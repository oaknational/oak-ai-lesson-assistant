export function stringListToText(list: string[]) {
  return list.map((item) => `- ${item}`).join("\n");
}
