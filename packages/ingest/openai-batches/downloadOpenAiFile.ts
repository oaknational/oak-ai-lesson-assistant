import OpenAI from "openai";

const openai = new OpenAI();

export async function downloadOpenAiFile({ fileId }: { fileId: string }) {
  const file = await openai.files.content(fileId);
  return { file };
}
