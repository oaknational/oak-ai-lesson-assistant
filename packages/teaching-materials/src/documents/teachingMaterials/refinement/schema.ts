import { z } from "zod";

export const refinementMap = {
  lowerReadingAge: "Lower reading age",
  increaseReadingAge: "Increase reading age",
} satisfies Record<AllowedRefinements, string>;

export const refinements = ["lowerReadingAge", "increaseReadingAge"] as const;

export type AllowedRefinements = (typeof refinements)[number];

const refinementTypes = z.enum([...refinements, "custom"] as const);

export const refinementSchema = z.object({
  type: refinementTypes,
  payload: z.string().optional(),
});

export type RefinementSchema = z.infer<typeof refinementSchema>;
