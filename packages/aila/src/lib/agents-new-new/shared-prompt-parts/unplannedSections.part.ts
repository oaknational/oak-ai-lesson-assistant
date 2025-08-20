import type { SectionKey } from "../schema";
import { createPromptPartMessageFn } from "./_createPromptPart";

export const unplannedSectionsPromptPart = createPromptPartMessageFn<
  SectionKey[]
>({
  heading: "UNPLANNED/UNFINISHED SECTIONS",
  description: () =>
    "These are the sections which have not yet been written or are incomplete/invalid",
  contentToString: (sections) =>
    sections.map((section) => `- ${section}`).join("\n"),
});
