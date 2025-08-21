import { buildPatches } from "./helpers/buildPatches";
import type { TextStreamer } from "./helpers/createTextStreamer";

export const createOnTurnComplete =
  (textStreamer: TextStreamer) =>
  <T extends object>(props: {
    prevDoc: T;
    nextDoc: T;
    sectionKeys: (keyof T)[];
    ailaMessage: string;
  }) => {
    const { prevDoc, nextDoc, sectionKeys, ailaMessage } = props;
    const patches = buildPatches(prevDoc, nextDoc);

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

    textStreamer(closingPart);
  };
