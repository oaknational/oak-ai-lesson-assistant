/**
 * Slide content extraction and types
 */

// Extraction functions
export {
  classifyNonTextElement,
  extractPresentationContent,
  extractSlideContent,
  extractSlideTitle,
  extractTableCells,
  extractTextFromTextElements,
  generateCellId,
  parseCellId,
} from "./extraction";

// Schemas
export {
  nonTextElementTypeSchema,
  parsedCellIdSchema,
  slideDeckContentSchema,
  slideContentSchema,
  slideNonTextElementSchema,
  slideTableCellSchema,
  slideTableSchema,
  slideTextElementSchema,
} from "./extraction";

// Types
export type {
  NonTextElementType,
  ParsedCellId,
  SlideDeckContent,
  SlideContent,
  SlideNonTextElement,
  SlideTable,
  SlideTableCell,
  SlideTextElement,
} from "./extraction";
