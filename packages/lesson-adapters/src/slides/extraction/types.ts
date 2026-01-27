export type NonTextElementType =
  | "shape"
  | "image"
  | "video"
  | "table"
  | "line"
  | "diagram"
  | "unknown";

export interface SlideTextElement {
  id: string;
  content: string;
  placeholderType?: string;
  placeholderIndex?: number;
  layoutObjectId?: string;
}

export interface SlideTableCell {
  /** Composite ID: {tableId}_r{row}c{col} for LLM reference */
  id: string;
  content: string;
  row: number;
  col: number;
}

export interface SlideTable {
  id: string;
  rows: number;
  columns: number;
  cells: SlideTableCell[][];
}

export interface SlideNonTextElement {
  id: string;
  type: NonTextElementType;
  description: string;
}

export interface SlideContent {
  slideNumber: number;
  slideId: string;
  slideTitle?: string;
  layoutName?: string;
  textElements: SlideTextElement[];
  tables: SlideTable[];
  nonTextElements: SlideNonTextElement[];
}

export interface SlideDeckContent {
  slideDeckId: string;
  lessonTitle: string;
  slides: SlideContent[];
}

/**
 * Parsed cell ID components
 */
export interface ParsedCellId {
  tableId: string;
  row: number;
  col: number;
}
