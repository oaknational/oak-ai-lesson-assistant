import type { docs_v1 } from "@googleapis/docs";

import { isImageQuizTable } from "../quiz/table-generators/questions/multipleChoice";

const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;

export enum ImageContext {
  PARAGRAPH = "paragraph",
  QUIZ_IMAGE_TABLE = "quiz_image_table",
  OTHER_TABLE = "other_table",
}

type ImageMatch = {
  url: string;
  altText: string;
  startIndex: number;
  context: ImageContext;
};

function handleMatch(
  match: RegExpExecArray,
  textElement: docs_v1.Schema$ParagraphElement,
  context: ImageContext,
): ImageMatch | null {
  const [, altText, url] = match;
  const textElementStartIndex = textElement.startIndex;
  const matchIndex = match.index;

  if (
    typeof textElementStartIndex !== "number" ||
    typeof matchIndex !== "number" ||
    !url ||
    typeof altText !== "string"
  ) {
    return null;
  }

  return {
    url,
    altText,
    startIndex: textElementStartIndex + matchIndex,
    context,
  };
}

function processTextElements(
  elements: docs_v1.Schema$ParagraphElement[],
  matches: ImageMatch[],
  context: ImageContext,
): void {
  for (const textElement of elements) {
    const textContent = textElement.textRun?.content ?? "";
    let match: RegExpExecArray | null;
    while ((match = markdownImageRegex.exec(textContent)) !== null) {
      const result = handleMatch(match, textElement, context);
      if (result) matches.push(result);
    }
  }
}

function processTableCells(
  cells: docs_v1.Schema$TableCell[],
  matches: ImageMatch[],
  context: ImageContext,
): void {
  for (const cell of cells) {
    for (const cellElement of cell.content ?? []) {
      if (cellElement.paragraph?.elements) {
        processTextElements(cellElement.paragraph.elements, matches, context);
      }
    }
  }
}

function processBodyElements(
  elements: docs_v1.Schema$StructuralElement[],
  matches: ImageMatch[],
): void {
  for (const element of elements) {
    if (element.table) {
      // Determine table context based on structure
      const context = isImageQuizTable(element.table)
        ? ImageContext.QUIZ_IMAGE_TABLE
        : ImageContext.OTHER_TABLE;

      for (const row of element.table.tableRows ?? []) {
        processTableCells(row.tableCells ?? [], matches, context);
      }
    }
    if (element.paragraph?.elements) {
      processTextElements(
        element.paragraph.elements,
        matches,
        ImageContext.PARAGRAPH,
      );
    }
  }
}

export async function findMarkdownImages(
  googleDocs: docs_v1.Docs,
  documentId: string,
): Promise<ImageMatch[]> {
  const doc = await googleDocs.documents.get({ documentId });
  const body = doc.data.body?.content;
  if (!body) return [];

  const matches: ImageMatch[] = [];
  processBodyElements(body, matches);
  return matches;
}
