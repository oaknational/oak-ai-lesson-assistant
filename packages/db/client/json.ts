import type { Prisma } from "@prisma/client";

/**
 * Prisma's JSON input type rejects `unknown` and `undefined` values, which
 * zod-parsed objects often contain. Serialising to JSON drops `undefined`, so
 * values that came from parsed JSON are safe to store as they are.
 */
export function toPrismaJson(
  value: string | number | boolean | object,
): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
