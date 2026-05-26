import type { slides_v1 } from "@googleapis/slides";

import { batchUpdate } from "./batchUpdate";

/**
 * Replacement for a regular text element.
 */
export interface TextElementReplacement {
  /** The objectId of the text element */
  objectId: string;
  /** The new text content */
  text: string;
}

/**
 * Replacement for a table cell.
 */
export interface TableCellReplacement {
  /** The objectId of the table */
  tableId: string;
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  col: number;
  /** The new text content */
  text: string;
}

/**
 * Replaces text in regular (non-table) text elements.
 * Each element's text is fully cleared then replaced.
 *
 * @param presentationId - The presentation to modify
 * @param replacements - Array of element replacements
 * @returns The batch update response
 */
export async function replaceTextElements(
  presentationId: string,
  replacements: TextElementReplacement[],
): Promise<slides_v1.Schema$BatchUpdatePresentationResponse> {
  const requests: slides_v1.Schema$Request[] = [];

  for (const { objectId, text } of replacements) {
    requests.push(
      {
        deleteText: {
          objectId,
          textRange: { type: "ALL" },
        },
      },
      {
        insertText: {
          objectId,
          text,
          insertionIndex: 0,
        },
      },
    );
  }

  return batchUpdate(presentationId, requests);
}

/**
 * Replaces text in table cells using cellLocation.
 *
 * @param presentationId - The presentation to modify
 * @param replacements - Array of table cell replacements
 * @returns The batch update response
 */
export async function replaceTableCellText(
  presentationId: string,
  replacements: TableCellReplacement[],
): Promise<slides_v1.Schema$BatchUpdatePresentationResponse> {
  const requests: slides_v1.Schema$Request[] = [];

  for (const { tableId, row, col, text } of replacements) {
    requests.push(
      {
        deleteText: {
          objectId: tableId,
          cellLocation: {
            rowIndex: row,
            columnIndex: col,
          },
          textRange: { type: "ALL" },
        },
      },
      {
        insertText: {
          objectId: tableId,
          cellLocation: {
            rowIndex: row,
            columnIndex: col,
          },
          text,
          insertionIndex: 0,
        },
      },
    );
  }

  return batchUpdate(presentationId, requests);
}

/**
 * Deletes page elements (shapes, images, text boxes) by their objectIds.
 *
 * @param presentationId - The presentation to modify
 * @param elementObjectIds - Array of element objectIds to delete
 * @returns The batch update response
 */
export async function deletePageElements(
  presentationId: string,
  elementObjectIds: string[],
): Promise<slides_v1.Schema$BatchUpdatePresentationResponse> {
  if (elementObjectIds.length === 0) {
    return { replies: [] };
  }

  const requests: slides_v1.Schema$Request[] = elementObjectIds.map(
    (objectId) => ({
      deleteObject: { objectId },
    }),
  );

  return batchUpdate(presentationId, requests);
}

/**
 * Deletes entire slides by their objectIds.
 *
 * @param presentationId - The presentation to modify
 * @param slideObjectIds - Array of slide objectIds to delete
 * @returns The batch update response
 */
export async function deleteSlides(
  presentationId: string,
  slideObjectIds: string[],
): Promise<slides_v1.Schema$BatchUpdatePresentationResponse> {
  if (slideObjectIds.length === 0) {
    return { replies: [] };
  }

  const requests: slides_v1.Schema$Request[] = slideObjectIds.map(
    (objectId) => ({
      deleteObject: { objectId },
    }),
  );

  return batchUpdate(presentationId, requests);
}
