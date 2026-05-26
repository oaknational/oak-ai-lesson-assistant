/**
 * Google Slides API exports
 */

// Client
export { createSlidesClient } from "./client";

// Fetch
export { getPresentation } from "./getPresentation";
export { getSlideThumbnails } from "./getThumbnails";

// Operations
export {
  duplicateSlideDeck,
  duplicateSlideDeckToDefaultFolder,
} from "./operations";

// Mutations
export { batchUpdate } from "./batchUpdate";
export {
  replaceTextElements,
  replaceTableCellText,
  deletePageElements,
  deleteSlides,
} from "./mutations";

// Types
export type {
  // Google API types
  SlidesClient,
  GoogleSlidesPresentation,
  GoogleSlidesPage,
  GoogleSlidesPageElement,
  GoogleSlidesTextElement,
  GoogleSlidesTable,
  GoogleSlidesShape,
  GoogleSlidesPlaceholder,
  // Duplicate options
  DuplicateSlideDeckOptions,
  DuplicateSlideDeckResult,
} from "./types";
export type { SlideThumbnail } from "./getThumbnails";
