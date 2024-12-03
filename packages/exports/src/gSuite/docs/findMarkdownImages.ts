import type { docs_v1 } from "@googleapis/docs";

export async function findMarkdownImages(
  googleDocs: docs_v1.Docs,
  documentId: string,
): Promise<{ url: string; altText: string; startIndex: number }[]> {
  const doc = await googleDocs.documents.get({ documentId });
  const body = doc.data.body?.content;

  if (!body) return [];

  const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const matches: { url: string; altText: string; startIndex: number }[] = [];

  function handleMatch(
    match: RegExpExecArray,
    textElement: docs_v1.Schema$ParagraphElement,
  ): void {
    const [, altText, url] = match;
    const textElementStartIndex = textElement.startIndex;
    const matchIndex = match.index;
    if (
      typeof textElementStartIndex !== "number" ||
      typeof matchIndex !== "number"
    ) {
      return;
    }
    const startIndex = textElementStartIndex + matchIndex;
    if (url && typeof altText === "string") {
      matches.push({ url, altText, startIndex });
    }
  }

  function processTextElements(elements: docs_v1.Schema$ParagraphElement[]) {
    for (const textElement of elements) {
      const textContent = textElement.textRun?.content ?? "";
      let match: RegExpExecArray | null;
      while ((match = markdownImageRegex.exec(textContent)) !== null) {
        handleMatch(match, textElement);
      }
    }
  }

  function processTableCells(cells: docs_v1.Schema$TableCell[]) {
    for (const cell of cells) {
      for (const cellElement of cell.content ?? []) {
        if (cellElement.paragraph?.elements) {
          processTextElements(cellElement.paragraph.elements);
        }
      }
    }
  }

  function processBodyElements(elements: docs_v1.Schema$StructuralElement[]) {
    for (const element of elements) {
      if (element.table) {
        for (const row of element.table.tableRows ?? []) {
          processTableCells(row.tableCells ?? []);
        }
      }
      if (element.paragraph?.elements) {
        processTextElements(element.paragraph.elements);
      }
    }
  }

  processBodyElements(body);

  return matches;
}
