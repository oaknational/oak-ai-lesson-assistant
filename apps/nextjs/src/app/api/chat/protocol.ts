import type {
  ActionDocument,
  ErrorDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";

export function streamingJSON(message: ErrorDocument | ActionDocument) {
  const jsonContent = JSON.stringify(message);
  const errorMessage = `0:"${jsonContent.replace(/"/g, '\\"')}"`;

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
