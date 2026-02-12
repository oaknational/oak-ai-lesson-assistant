import { z } from "zod";

import {
  nonTextElementTypeSchema,
  parsedCellIdSchema,
  slideContentSchema,
  slideDeckContentSchema,
  slideNonTextElementSchema,
  slideTableCellSchema,
  slideTableSchema,
  slideTextElementSchema,
} from "./schemas";

export type NonTextElementType = z.infer<typeof nonTextElementTypeSchema>;

export type SlideTextElement = z.infer<typeof slideTextElementSchema>;

export type SlideTableCell = z.infer<typeof slideTableCellSchema>;

export type SlideTable = z.infer<typeof slideTableSchema>;

export type SlideNonTextElement = z.infer<typeof slideNonTextElementSchema>;

export type SlideContent = z.infer<typeof slideContentSchema>;

export type SlideDeckContent = z.infer<typeof slideDeckContentSchema>;

export type ParsedCellId = z.infer<typeof parsedCellIdSchema>;
