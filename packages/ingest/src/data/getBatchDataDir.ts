export function getBatchDataDir({ ingestId }: { ingestId: string }) {
  return `${__dirname}/batches/ingest_${ingestId}`;
}
