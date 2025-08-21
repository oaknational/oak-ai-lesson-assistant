import type { SectionKey } from "../schema";
import type { TextStreamer } from "./helpers/createTextStreamer";

export const createOnPlannerComplete =
  (textStreamer: TextStreamer) =>
  ({ sectionKeys }: { sectionKeys: SectionKey[] }) => {
    // Stream the opening part of the message with sectionsToEdit
    const openingPart = `{"type":"llmMessage","sectionsToEdit":${JSON.stringify(sectionKeys)},"patches":[`;
    textStreamer(openingPart);
  };
