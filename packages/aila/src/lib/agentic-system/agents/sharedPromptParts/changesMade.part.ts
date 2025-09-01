import { compare } from "fast-json-patch";

import { createPromptPartMessageFn } from "./_createPromptPart";

export const changesMadePromptPart = createPromptPartMessageFn<{
  prevDoc: object;
  nextDoc: object;
}>({
  heading: "CHANGES MADE",
  description: () =>
    "These are the changes made to the document during this turn. It will be a json patch diff between the previous and current versions of the document",
  contentToString: ({ prevDoc, nextDoc }) =>
    JSON.stringify(compare(prevDoc, nextDoc)),
});
