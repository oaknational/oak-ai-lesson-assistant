import type { docs_v1 } from "@googleapis/docs";

const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;

type ImageMatch = { url: string; altText: string; startIndex: number };

function handleMatch(
  match: RegExpExecArray,
  textElement: docs_v1.Schema$ParagraphElement,
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

  return { url, altText, startIndex: textElementStartIndex + matchIndex };
}

function processTextElements(
  elements: docs_v1.Schema$ParagraphElement[],
  matches: ImageMatch[],
): void {
  for (const textElement of elements) {
    const textContent = textElement.textRun?.content ?? "";
    let match: RegExpExecArray | null;
    while ((match = markdownImageRegex.exec(textContent)) !== null) {
      const result = handleMatch(match, textElement);
      if (result) matches.push(result);
    }
  }
}

function processTableCells(
  cells: docs_v1.Schema$TableCell[],
  matches: ImageMatch[],
): void {
  for (const cell of cells) {
    for (const cellElement of cell.content ?? []) {
      if (cellElement.paragraph?.elements) {
        processTextElements(cellElement.paragraph.elements, matches);
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
      for (const row of element.table.tableRows ?? []) {
        processTableCells(row.tableCells ?? [], matches);
      }
    }
    if (element.paragraph?.elements) {
      processTextElements(element.paragraph.elements, matches);
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
