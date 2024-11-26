import { z } from "zod";

const UnknownStreamMessageSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

type UnknownStreamMessage = z.infer<typeof UnknownStreamMessageSchema>;
export async function consumeStream(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = stream.getReader();
  let result = "";
  let isComplete = false;
  const maxTimeout = 30000; // 30 seconds timeout
  const startTime = Date.now();

  while (!isComplete && Date.now() - startTime < maxTimeout) {
    const { value, done } = await reader.read();
    if (done) {
      isComplete = true;
      break;
    }
    if (value) {
      result += new TextDecoder().decode(value);
    }
  }

  if (!isComplete) {
    throw new Error("Stream reading timed out");
  }

  return result;
}

export function extractStreamMessage(
  streamedText: string,
): UnknownStreamMessage {
  const content = streamedText.match(/0:"(.*)"/);
  if (!content?.[1]) {
    throw new Error("No message found in streamed text");
  }
  const strippedContent = content[1].replace(/\\"/g, '"');
  const parsedMessage = JSON.parse(strippedContent) as unknown;
  return UnknownStreamMessageSchema.parse(parsedMessage);
}
