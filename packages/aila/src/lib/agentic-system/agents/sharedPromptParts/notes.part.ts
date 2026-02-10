import type { SectionKey } from "../../schema";
import { createPromptPartMessageFn } from "./_createPromptPart";

export const notesPromptPart = createPromptPartMessageFn<
  { message: string; sectionKey: SectionKey }[]
>({
  heading: "NOTES",
  description: () =>
    "The following notes were raised during section generation. You MUST communicate these to the user:",
  contentToString: (notes) =>
    notes.map((note) => `- [${note.sectionKey}]: ${note.message}`).join("\n"),
});
