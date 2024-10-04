import fs from "fs";

import { openai } from "./openai";

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
