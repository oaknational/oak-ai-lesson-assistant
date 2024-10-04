import { openai } from "./openai";

export async function retrieveOpenAiBatch({ batchId }: { batchId: string }) {
  const batch = await openai.batches.retrieve(batchId);

  return { batch };
}
