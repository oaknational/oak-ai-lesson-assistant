/**
 * Google Slides API exports
 */

// Client
export { createSlidesClient } from "./client";

// Fetch
export { getPresentation } from "./getPresentation";

// Operations
export {
  duplicateSlideDeck,
  duplicateSlideDeckToDefaultFolder,
} from "./operations";

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
