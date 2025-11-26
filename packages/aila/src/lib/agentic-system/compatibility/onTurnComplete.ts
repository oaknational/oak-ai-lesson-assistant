import { aiLogger } from "@oakai/logger";

import { isTruthy } from "remeda";

import { buildPatches } from "./helpers/buildPatches";
import type { TextStreamer } from "./helpers/createTextStreamer";

const log = aiLogger("aila:agents");

export const createOnTurnComplete =
  (textStreamer: TextStreamer) =>
  <T extends object>(props: {
    prevDoc: T;
    nextDoc: T;
    ailaMessage: string;
  }) => {
    const { prevDoc, nextDoc, ailaMessage } = props;
    const patches = buildPatches(prevDoc, nextDoc);
    const sectionKeys = patches
      .map((patch) =>
        "path" in patch && typeof patch.path === "string" ? patch.path : null,
      )
      .map((path) => path?.split("/")[1])
      .filter(isTruthy);

    // Create the llmMessage
    const llmMessage = {
      type: "llmMessage",
      sectionsToEdit: sectionKeys,
      patches,
      sectionsEdited: sectionKeys,
      prompt: {
        type: "text",
        value:
          ailaMessage ??
          "Here's the updated lesson plan. Do you want to make any more changes?",
      },
      status: "complete",
    };

    // Stream the closing part of the message with sectionsEdited and prompt
    const closingPart = `],"sectionsEdited":${JSON.stringify(llmMessage.sectionsEdited)},"prompt":${JSON.stringify(llmMessage.prompt)},"status":"complete"}`;

    log.info("onTurnComplete: ", closingPart);
    textStreamer(closingPart);
  };
