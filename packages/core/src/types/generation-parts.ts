import { z } from "zod";

export const enum GenerationPartType {
  AIGenerated = "aiGenerated",
  UserGenerated = "userGenerated",
  UserTweaked = "userTweaked",
  Placeholder = "placeholder",
}

export function generationPartAIGeneratedSchema<Value extends z.ZodTypeAny>(
  valueSchema: Value,
) {
  return z.object({
    type: z.literal("aiGenerated"),
    value: valueSchema,
    lastGenerationId: z.string(),
  }) as z.ZodType<GenerationPartAIGenerated<z.infer<Value>>>;
}

export type GenerationPartAIGenerated<Value = string> = {
  type: GenerationPartType.AIGenerated;
  value: Value;
  lastGenerationId: string;
};

export function generationPartUserGeneratedSchema<Value extends z.ZodTypeAny>(
  valueSchema: Value,
) {
  return z.object({
    type: z.literal("userGenerated"),
    value: valueSchema,
    lastGenerationId: z.null(),
  }) as z.ZodType<GenerationPartUserGenerated<z.infer<Value>>>;
}

export type GenerationPartUserGenerated<Value = string> = {
  type: GenerationPartType.UserGenerated;
  value: Value;
  lastGenerationId: null;
};

export function generationPartUserTweakedSchema<Value extends z.ZodTypeAny>(
  valueSchema: Value,
) {
  return z.object({
    type: z.literal("userTweaked"),
    value: valueSchema,
    originalValue: valueSchema,
    lastGenerationId: z.string(),
  }) as z.ZodType<GenerationPartUserTweaked<z.infer<Value>>>;
}

export type GenerationPartUserTweaked<Value = string> = {
  type: GenerationPartType.UserTweaked;
  value: Value;
  originalValue: Value;
  lastGenerationId: string;
};

export function generationPartPlaceholderSchema<Value extends z.ZodTypeAny>(
  valueSchema: Value,
) {
  return z.object({
    type: z.literal("placeholder"),
    value:
      valueSchema instanceof z.ZodObject
        ? valueSchema.deepPartial().optional()
        : valueSchema.optional(),
    lastGenerationId: z.string(),
  }) as z.ZodType<GenerationPartPlaceholder<z.infer<Value>>>;
}

export type GenerationPartPlaceholder<Value = string> = {
  type: GenerationPartType.Placeholder;
  value?: Value;
  lastGenerationId: string;
};

export function generationPartSchema<Value extends z.ZodTypeAny>(
  valueSchema: Value,
) {
  return z.discriminatedUnion("type", [
    generationPartAIGeneratedSchema<Value>(
      valueSchema,
    ) as unknown as z.ZodDiscriminatedUnionOption<"type">,
    generationPartUserGeneratedSchema<Value>(
      valueSchema,
    ) as unknown as z.ZodDiscriminatedUnionOption<"type">,
    generationPartUserTweakedSchema<Value>(
      valueSchema,
    ) as unknown as z.ZodDiscriminatedUnionOption<"type">,
  ]) as unknown as z.ZodType<GenerationPart<z.infer<Value>>>;
}

/**
 * Note: zod/ts gets confused when trying to narrow the types of the GenerationPart
 * union when the types are inferred via the following:
 * ```
 *   export type GenerationPart<Value> = z.infer<
 *     ReturnType<typeof generationPartSchema<z.ZodType<Value>>>
 *   >;
 * ```
 * so for now the types manually mirror the zod types, and anywhere
 * they're incompatible ts should error
 */
export type GenerationPart<Value = string> =
  | GenerationPartUserGenerated<Value>
  | GenerationPartAIGenerated<Value>
  | GenerationPartUserTweaked<Value>;

export type GenerationPartOrPlaceholder<Value = string> =
  | GenerationPartUserGenerated<Value>
  | GenerationPartAIGenerated<Value>
  | GenerationPartUserTweaked<Value>
  | GenerationPartPlaceholder<Value>;
