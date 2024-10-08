import { openai } from "./openai";

export async function downloadOpenAiFile({ fileId }: { fileId: string }) {
  const file = await openai.files.content(fileId);
  return { file };
}
