import { createPromptPartMessageFn } from "./_createPromptPart";

export const currentDocumentPromptPart = createPromptPartMessageFn<object>({
  heading: "CURRENT DOCUMENT",
  description: () => "This is the document in its current state.",
  contentToString: (document) => JSON.stringify(document, null, 2),
});
