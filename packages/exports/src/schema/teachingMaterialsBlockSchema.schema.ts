import { z } from "zod";

// Simple block types - only title and placeholders are used now
const title = z.object({
  type: z.literal("title"),
  text: z.string(),
});

const placeholdersBlock = z.object({
  type: z.literal("placeholders"),
  map: z.record(z.string(), z.string()),
});

export const block = z.union([title, placeholdersBlock]);
export type Block = z.infer<typeof block>;

export const blocksSchema = z.array(block);
export type Blocks = z.infer<typeof blocksSchema>;
