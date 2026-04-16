import type { slides_v1 } from "@googleapis/slides";

/**
 * Google Slides API client type
 */
export type SlidesClient = slides_v1.Slides;

/**
 * Explicit Google Slides schema types for external use
 */
export type GoogleSlidesPresentation = slides_v1.Schema$Presentation;
export type GoogleSlidesPage = slides_v1.Schema$Page;
export type GoogleSlidesPageElement = slides_v1.Schema$PageElement;
export type GoogleSlidesTextElement = slides_v1.Schema$TextElement;
export type GoogleSlidesTable = slides_v1.Schema$Table;
export type GoogleSlidesShape = slides_v1.Schema$Shape;
export type GoogleSlidesPlaceholder = slides_v1.Schema$Placeholder;

/**
 * Result of duplicating a slide deck
 */
export interface DuplicateSlideDeckResult {
  /** ID of the duplicated presentation */
  presentationId: string;
  /** Web view URL of the duplicated presentation */
  presentationUrl: string;
  /** Name of the duplicated presentation */
  name: string;
}

/**
 * Options for duplicating a slide deck
 */
export interface DuplicateSlideDeckOptions {
  /** Source presentation URL */
  sourceUrl: string;
  /** Name for the duplicated presentation */
  name: string;
  /** Folder ID to store the duplicated presentation */
  destinationFolderId: string;
}
