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
