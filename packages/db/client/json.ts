import type { Prisma } from "../generated/prisma/client";

/**
 * Narrows a value to Prisma's JSON input type, for writing to a Json column.
 *
 * This is a type-level step only: it doesn't validate, copy or serialise the
 * value. Callers must pass JSON-compatible data, such as parsed JSON or zod
 * output, not class instances, functions or bigints.
 *
 * It exists because Prisma's JSON input type rejects the `unknown` and
 * `undefined` values that such objects often contain in their types. Prisma
 * drops `undefined` when it serialises the value.
 */
export function asPrismaJson(
  value: string | number | boolean | object,
): Prisma.InputJsonValue {
  return value;
}
