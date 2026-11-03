/**
 * Clients send this header to read /api/chat as plain text. Every successful
 * chat response carries it too, so clients can tell Aila's stream from other
 * responses, such as a page reached through a redirect.
 */
export const CHAT_STREAM_PROTOCOL_HEADER = "x-aila-stream-protocol";
export const CHAT_STREAM_PROTOCOL = "text";

/**
 * Tabs opened before the AI SDK 7 upgrade read the AI SDK 4 data stream, where
 * each chunk is a text part, and don't send the header.
 * TODO(ADAPT-194): remove the legacy framing once those tabs are gone
 */
export function formatChatResponse(
  request: Request,
  response: Response,
): Response {
  if (!response.ok || !response.body) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set(CHAT_STREAM_PROTOCOL_HEADER, CHAT_STREAM_PROTOCOL);
  const body =
    request.headers.get(CHAT_STREAM_PROTOCOL_HEADER) === CHAT_STREAM_PROTOCOL
      ? response.body
      : frameAsDataStream(response.body);

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function frameAsDataStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const enqueueTextPart = (
    text: string,
    controller: TransformStreamDefaultController<Uint8Array>,
  ) => {
    if (text) {
      controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
    }
  };
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        // Streaming decode keeps characters split across chunks intact
        enqueueTextPart(decoder.decode(chunk, { stream: true }), controller);
      },
      flush(controller) {
        enqueueTextPart(decoder.decode(), controller);
      },
    }),
  );
}
