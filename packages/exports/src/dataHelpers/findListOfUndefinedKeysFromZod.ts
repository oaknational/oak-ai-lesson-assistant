export function humanizeCamelCaseString(str: string) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

export function findListOfUndefinedKeysFromZod(
  errors: {
    expected: string;
    received: string;
    code: string;
    path: (string | number)[];
    message: string;
  }[],
) {
  const undefinedItems: (string | number)[] = [];

  // Map through errors and find undefined items
  errors.forEach((e) => {
    if (e.received === "undefined") {
      undefinedItems.push(...e.path);
    }
  });

  // Make array human readable
  const humanReadableArray = undefinedItems.map((item) => {
    if (typeof item === "number") {
      return `[${item}]`;
    }
    if (item.includes("cycle")) {
      return "Cycle " + item.split("cycle")[1];
    }
    return humanizeCamelCaseString(item);
  });
  return humanReadableArray;
}
