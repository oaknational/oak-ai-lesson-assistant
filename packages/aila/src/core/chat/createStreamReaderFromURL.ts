export async function createStreamReaderFromURL(
  apiUrl: string,
): Promise<ReadableStreamDefaultReader<string>> {
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch stream from API: ${response.statusText}`);
  }

  const textDecoder = new TextDecoder();
  const streamReader = response.body.getReader();

  return new ReadableStream<string>({
    async start(controller) {
      const readChunk = async () => {
        try {
          const { done, value } = await streamReader.read();
          if (done) {
            controller.close();
            return;
          }

          const decoded = textDecoder.decode(value, { stream: true });
          const lines = decoded.split("\n");
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(line.trim());
            }
          }
          await readChunk();
        } catch (error) {
          controller.error(error);
        }
      };

      await readChunk();
    },
    async cancel() {
      await streamReader.cancel();
    },
  }).getReader();
}
