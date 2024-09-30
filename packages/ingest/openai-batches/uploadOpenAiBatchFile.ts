import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

export async function uploadOpenAiBatchFile({
  filePath,
}: {
  filePath: string;
}) {
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "batch",
  });

  return { file };
}
