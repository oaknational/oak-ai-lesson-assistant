export async function consumeStream(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let result = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      result += new TextDecoder().decode(value);
    }
  }

  return result;
}

export function extractStreamMessage(streamedText: string) {
  const content = streamedText.match(/0:"(.*)"/);
  if (!content?.[1]) {
    throw new Error("No message found in streamed text");
  }
  const strippedContent = content[1].replace(/\\"/g, '"');
  return JSON.parse(strippedContent);
}
