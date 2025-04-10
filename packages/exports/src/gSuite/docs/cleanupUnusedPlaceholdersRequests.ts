import type { docs_v1 } from "@googleapis/docs";

export async function cleanupUnusedPlaceholdersRequests(
  googleDocs: docs_v1.Docs,
  documentId: string,
): Promise<docs_v1.Schema$Request[]> {
  const requests: docs_v1.Schema$Request[] = [];

  // Get the document content
  const doc = await googleDocs.documents.get({ documentId });
  const bodyContent = doc.data.body?.content ?? [];

  // Find all unique placeholder patterns in the document
  const placeholderSet = new Set<string>();

  // Regular expression to match {{anything}} pattern
  const fullPlaceholderRegex = /\{\{[^}]+\}\}/g;

  // Scan the document for placeholders
  for (const element of bodyContent) {
    if (!element.paragraph) continue;

    for (const run of element.paragraph.elements ?? []) {
      const text = run.textRun?.content;
      if (!text) continue;

      // Find all {{...}} placeholders
      const matches = text.match(fullPlaceholderRegex);
      if (matches) {
        matches.forEach((match) => placeholderSet.add(match));
      }
    }
  }

  // Create requests to replace each placeholder with empty string
  for (const placeholder of placeholderSet) {
    requests.push({
      replaceAllText: {
        containsText: {
          text: placeholder,
          matchCase: true,
        },
        replaceText: "",
      },
    });
  }

  return requests;
}
