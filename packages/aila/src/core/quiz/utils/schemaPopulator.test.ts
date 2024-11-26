import { z } from "zod";

import { populateZodSchema } from "./schemaPopulator";

describe("populateZodSchema", () => {
  it("should populate primitive types correctly", () => {
    expect(populateZodSchema(z.string())).toBe("sample string");
    expect(populateZodSchema(z.number())).toBe(1.0);
    expect(populateZodSchema(z.boolean())).toBe(true);
  });

  it("should populate arrays correctly", () => {
    const arraySchema = z.array(z.string());
    const result = populateZodSchema(arraySchema);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["sample string"]);
  });

  it("should populate nested objects correctly", () => {
    const nestedSchema = z.object({
      name: z.string(),
      details: z.object({
        age: z.number(),
        active: z.boolean(),
      }),
    });

    const result = populateZodSchema(nestedSchema);
    expect(result).toEqual({
      name: "sample string",
      details: {
        age: 1.0,
        active: true,
      },
    });
  });

  it("should populate enums correctly", () => {
    const enumSchema = z.enum(["a", "b", "c"]);
    const result = populateZodSchema(enumSchema);
    expect(result).toBe("a");
  });

  it("should populate union types correctly", () => {
    const unionSchema = z.union([z.string(), z.number()]);
    const result = populateZodSchema(unionSchema);
    expect(typeof result).toBe("string");
    expect(result).toBe("sample string");
  });

  it("should populate optional fields correctly", () => {
    const optionalSchema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });

    const result = populateZodSchema(optionalSchema);
    expect(result).toEqual({
      required: "sample string",
      optional: "sample string",
    });
  });

  it("should populate nullable fields correctly", () => {
    const nullableSchema = z.string().nullable();
    const result = populateZodSchema(nullableSchema);
    expect(result).toBe("sample string");
  });

  it("should populate complex nested structures correctly", () => {
    const complexSchema = z.object({
      name: z.string(),
      age: z.number(),
      isActive: z.boolean(),
      type: z.enum(["rag", "ml", "basedOnRag"]),
      tags: z.array(z.string()),
      settings: z.object({
        enabled: z.boolean(),
        mode: z.enum(["simple", "demo", "basedOn"]),
      }),
    });

    const result = populateZodSchema(complexSchema);
    expect(result).toEqual({
      name: "sample string",
      age: 1.0,
      isActive: true,
      type: "rag",
      tags: ["sample string"],
      settings: {
        enabled: true,
        mode: "simple",
      },
    });
  });
});
