import { z } from "zod";

// Doc blocks

const title = z.object({
  type: z.literal("title"),
  text: z.string(),
});

const labelValue = z.object({
  label: z.string(),
  value: z.string(),
});

const labelValueArray = z.object({
  type: z.literal("labelValue"),
  items: z.array(labelValue),
});

export const block = z.union([title, labelValueArray]);
export type Block = z.infer<typeof block>;

export const blocksSchema = z.array(block);
export type Blocks = z.infer<typeof blocksSchema>;

// Resource schemas

export const glossaryTemplate = z.union([title, labelValueArray]);

export type GlossaryTemplate = z.infer<typeof glossaryTemplate>;
