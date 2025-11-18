export const stringListToText = <T>(
  ...args: T extends string ? [] | [(item: T) => string] : [(item: T) => string]
) => {
  const mapFn = args[0];
  return (list: T[]) =>
    list
      .map((item) => `- ${mapFn ? mapFn(item) : (item as unknown as string)}`)
      .join("\n");
};
