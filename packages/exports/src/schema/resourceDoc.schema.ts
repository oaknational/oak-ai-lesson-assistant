import { z } from "zod";

// Doc parts

const title = z.string();

const labelValue = z.object({
  label: z.string(),
  value: z.string(),
});
const labelValueArray = z.array(labelValue);

// Resource schemas

export const glossaryTemplate = z.object({ title, labelValueArray });

export type GlossaryTemplate = z.infer<typeof glossaryTemplate>;
