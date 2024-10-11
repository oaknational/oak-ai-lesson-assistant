export function toMarkdownList<T>(
  items: T[],
  getListItemText?: (item: T, i: number) => string,
) {
  return items
    .map((item, i) => `- ${getListItemText ? getListItemText(item, i) : item}`)
    .join("\n");
}
