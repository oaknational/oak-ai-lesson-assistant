import { aiLogger } from "@oakai/logger";

import type { SectionKey } from "../schema";
import type { TextStreamer } from "./helpers/createTextStreamer";

const log = aiLogger("aila:agents");

export const createOnPlannerComplete =
  (textStreamer: TextStreamer) =>
  ({ sectionKeys }: { sectionKeys: SectionKey[] }) => {
    // Stream the opening part of the message with sectionsToEdit
    const openingPart = `{"type":"llmMessage","sectionsToEdit":${JSON.stringify(sectionKeys)},"patches":[`;

    log.info("onPlannerComplete: ", openingPart);
    textStreamer(openingPart);
  };
