export async function chunkAndPromiseAll<T, U>({
  data,
  fn,
  chunkSize,
}: {
  data: T[];
  fn: (chunk: T[]) => Promise<U>;
  chunkSize: number;
}): Promise<U[]> {
  // Split data into chunks
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  // Process all chunks concurrently with Promise.all
  return Promise.all(chunks.map((chunk) => fn(chunk)));
}
