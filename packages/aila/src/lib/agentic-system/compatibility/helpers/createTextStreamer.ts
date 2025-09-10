export type TextStreamer = (text: string) => void;

export const createTextStreamer =
  (
    controller: ReadableStreamDefaultController,
    chat: { appendChunk: (chunk: string) => void },
  ) =>
  (text: string) => {
    // Stream character by character or in small groups to mimic the legacy format
    for (let i = 0; i < text.length; i++) {
      const chunkSize = Math.min(
        1 + Math.floor(Math.random() * 2),
        text.length - i,
      );
      const chunk = text.substring(i, i + chunkSize);
      controller.enqueue(chunk);
      chat.appendChunk(chunk);
      i += chunkSize - 1;
    }
  };
