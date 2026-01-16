import type { slides_v1 } from "@googleapis/slides";

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

/**
 * Google Slides API client type
 */
export type SlidesClient = slides_v1.Slides;
