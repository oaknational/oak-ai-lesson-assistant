export function getBatchDataDir({ ingestId }: { ingestId: string }) {
  return `${__dirname}/batches/${ingestId}`;
}
