export type TextStreamer = (text: string) => void;

export const createTextStreamer =
  (
    controller: ReadableStreamDefaultController,
    chat: { appendChunk: (chunk: string) => void },
  ) =>
  (text: string) => {
    controller.enqueue(text);
    chat.appendChunk(text);
  };
