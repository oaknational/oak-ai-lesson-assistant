import { z } from "zod";

// Define Zod schema for the template structure
export const StructuralElementSchema = z.object({
  startIndex: z.number().optional(),
  endIndex: z.number().optional(),
  paragraph: z.any().optional(), // Complex nested structure, using any for flexibility
  table: z.any().optional(),
  sectionBreak: z.any().optional(),
}).passthrough(); // Allow additional properties from Google Docs API

export const QuestionTemplateSchema = z.object({
  tabName: z.string(),
  content: z.array(StructuralElementSchema)
});

export const QuestionTemplatesSchema = z.array(QuestionTemplateSchema);

// Infer types from schemas
export type StructuralElement = z.infer<typeof StructuralElementSchema>;
export type QuestionTemplate = z.infer<typeof QuestionTemplateSchema>;
export type QuestionTemplates = z.infer<typeof QuestionTemplatesSchema>;