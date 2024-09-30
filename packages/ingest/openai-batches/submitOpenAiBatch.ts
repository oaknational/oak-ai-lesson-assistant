import OpenAI from "openai";

const openai = new OpenAI();

export async function submitOpenAiBatch({
  fileId,
  endpoint,
}: {
  fileId: string;
  endpoint: OpenAI.BatchCreateParams["endpoint"];
}) {
  const batch = await openai.batches.create({
    input_file_id: fileId,
    endpoint,
    completion_window: "24h",
  });

  return { batch };
}
