import OpenAI from "openai";

const openai = new OpenAI();

export async function retrieveOpenAiBatch({ batchId }: { batchId: string }) {
  const batch = await openai.batches.retrieve(batchId);

  return { batch };
}
