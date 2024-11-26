import { z } from "zod";

// This function is used to randomly generate sample objects in line with a zod schema. It is used for testing and hacky workarounds.
export function populateZodSchema<T extends z.ZodType>(schema: T): z.infer<T> {
  if (schema instanceof z.ZodString) {
    return "sample string" as any;
  }
  if (schema instanceof z.ZodNumber) {
    return 1.0 as any;
  }
  if (schema instanceof z.ZodBoolean) {
    return true as any;
  }
  if (schema instanceof z.ZodArray) {
    return [populateZodSchema(schema.element)] as any;
  }
  if (schema instanceof z.ZodObject) {
    const shape = (schema as any)._def.shape;
    const populated: any = {};
    const shapeEntries = typeof shape === "function" ? shape() : shape;
    for (const [key, value] of Object.entries(shapeEntries)) {
      populated[key] = populateZodSchema(value as z.ZodType);
    }
    return populated;
  }
  if (schema instanceof z.ZodEnum) {
    return (schema as any)._def.values[0];
  }
  if (schema instanceof z.ZodUnion) {
    return populateZodSchema((schema as any)._def.options[0]);
  }
  if (schema instanceof z.ZodOptional) {
    return populateZodSchema((schema as any)._def.innerType);
  }
  if (schema instanceof z.ZodNullable) {
    return populateZodSchema((schema as any)._def.innerType);
  }
  return undefined as any;
}

// // Usage example:
// const SampleSchema = z.object({
//   name: z.string(),
//   age: z.number(),
//   isActive: z.boolean(),
//   type: z.enum(["rag", "ml", "basedOnRag"]),
//   tags: z.array(z.string()),
//   settings: z.object({
//     enabled: z.boolean(),
//     mode: z.enum(["simple", "demo", "basedOn"]),
//   }),
// });

// // Generate sample data
// const sample = populateZodSchema(SampleSchema);
