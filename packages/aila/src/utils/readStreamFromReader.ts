export async function readStreamFromReader(
  reader: ReadableStreamDefaultReader<string>,
): Promise<string> {
  let content = "";
  try {
    const maxExecutionTime = 30000; // 30 seconds
    const startTime = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() - startTime > maxExecutionTime) {
        throw new Error("Stream reading timed out");
      }

      const { done, value } = await reader.read();
      if (done) break;
      content += value;
    }
  } finally {
    reader.releaseLock();
  }
  return content;
}
