type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}${infer Rest}`
    ? `${T}${Uppercase<U>}${SnakeToCamelCase<Rest>}`
    : S;
export type ConvertKeysToCamelCase<T> =
  T extends Array<infer U>
    ? Array<ConvertKeysToCamelCase<U>>
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<
            K & string
          >]: ConvertKeysToCamelCase<T[K]>;
        }
      : T;
export function convertKey(key: string): string {
  return key.replace(/(_\w)/g, (_, m) => m[1].toUpperCase());
}
function keysToCamelCase<T>(obj: T): ConvertKeysToCamelCase<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      keysToCamelCase(item),
    ) as ConvertKeysToCamelCase<T>;
  } else if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = convertKey(key);
      acc[newKey as keyof typeof acc] = keysToCamelCase(value);
      return acc;
    }, {} as ConvertKeysToCamelCase<T>);
  }
  return obj as ConvertKeysToCamelCase<T>;
}
export default keysToCamelCase;
