import {
  ActionDocument,
  ErrorDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { StreamingTextResponse } from "ai";

export function streamingJSON(message: ErrorDocument | ActionDocument) {
  const errorMessage = JSON.stringify(message);
  const errorEncoder = new TextEncoder();

  return new StreamingTextResponse(
    new ReadableStream({
      async start(controller) {
        controller.enqueue(errorEncoder.encode(errorMessage));
        controller.close();
      },
    }),
  );
}
