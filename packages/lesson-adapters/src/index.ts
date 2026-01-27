/**
 * Public exports for lesson adapters.
 */

// Slides - extraction functions and LLM-friendly content types
export {
  // Extraction functions
  classifyNonTextElement,
  extractPresentationContent,
  extractSlideContent,
  extractSlideTitle,
  extractTableCells,
  extractTextFromTextElements,
  // Utilities
  generateCellId,
  parseCellId,
  // Types
  type NonTextElementType,
  type ParsedCellId,
  type PresentationContent,
  type SlideContent,
  type SlideNonTextElement,
  type SlideTable,
  type SlideTableCell,
  type SlideTextElement,
} from "./slides";
