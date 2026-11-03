import type {
  ActionDocument,
  ErrorDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";

export function streamingJSON(message: ErrorDocument | ActionDocument) {
  // The client reads the response as a plain text stream
  const errorMessage = JSON.stringify(message);

  const errorEncoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(errorEncoder.encode(errorMessage));
        controller.close();
      },
    }),
  );
}
