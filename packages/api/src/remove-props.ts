function isPlainObject(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeProperty = (obj: any, prop: string): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeProperty(item, prop));
  }

  if (isPlainObject(obj) && obj !== null) {
    for (const key in obj) {
      if (key === prop) {
        delete obj[key];
      } else {
        obj[key] = removeProperty(obj[key], prop);
      }
    }
  }
  return obj;
};
