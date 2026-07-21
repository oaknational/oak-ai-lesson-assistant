import { generateMock as baseGenerateMock } from "@anatine/zod-mock";
import type { z } from "zod/v3";

/**
 * Thin wrapper around @anatine/zod-mock.
 *
 * After the Zod 4 upgrade the library's types resolve to Zod 4 (it imports the
 * bare `zod` specifier), but our schemas are still Zod 3. The single cast here
 * bridges that type gap; at runtime the library reads the Zod 3 schema's `_def`
 * exactly as before. Import from here instead of `@anatine/zod-mock` directly
 * so the cast lives in one place.
 *
 * Alternative considered: `zocker` (Zod-4-native, has a dedicated `zod/v3`
 * codepath so it accepts our schemas with no cast). It was tried and does
 * generate valid data for our schemas at runtime, but it depends on the
 * ESM-only `@faker-js/faker@10` and ships no `exports` map, so ts-jest
 * resolves its CJS entry and crashes require()-ing ESM faker. Adopting it
 * would need Jest ESM config changes, so for now the cast above is simpler.
 */
export function generateMock<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  return baseGenerateMock(
    schema as unknown as Parameters<typeof baseGenerateMock>[0],
  ) as z.infer<T>;
}
