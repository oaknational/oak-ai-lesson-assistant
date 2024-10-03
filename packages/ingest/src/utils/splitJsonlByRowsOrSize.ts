import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

import { IngestError } from "../IngestError";

/**
 * Splits a large .jsonl file into multiple files, based on whichever limit is hit first: max rows or max file size.
 * @param options - An object containing the options for splitting the file
 * @param options.inputFilePath - The path to the large .jsonl file
 * @param options.outputDir - Directory to save the split .jsonl files
 * @param options.maxRows - Maximum number of rows per output file
 * @param options.maxFileSizeMB - Maximum size of each output file in MB
 * @returns {Promise<{ filePaths: string[] }>} - An object containing an array of file paths for the newly created split files
 */
export async function splitJsonlByRowsOrSize({
  inputFilePath,
  outputDir,
  maxRows,
  maxFileSizeMB,
}: {
  inputFilePath: string;
  outputDir: string;
  maxRows: number;
  maxFileSizeMB: number;
}): Promise<{ filePaths: string[] }> {
  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
  let currentFileIndex = 0;
  let currentRowCount = 0;
  let currentFileSize = 0;
  let currentFileStream: fs.WriteStream;
  const outputFilePaths: string[] = [];
  const inputFileName = path.basename(inputFilePath);

  try {
    const readStream = fs.createReadStream(inputFilePath, {
      encoding: "utf-8",
    });
    const rl = readline.createInterface({ input: readStream });

    const createNewWriteStream = (): fs.WriteStream => {
      if (currentFileStream) {
        currentFileStream.end(); // Close the old file stream
      }

      const outputFilePath = path.join(
        outputDir,
        `${inputFileName}_${currentFileIndex}.jsonl`,
      );
      const newWriteStream = fs.createWriteStream(outputFilePath);
      console.log(`Creating new file: ${outputFilePath}`);
      outputFilePaths.push(outputFilePath);
      currentFileIndex++;
      currentRowCount = 0;
      currentFileSize = 0;

      return newWriteStream;
    };

    currentFileStream = createNewWriteStream();

    for await (const line of rl) {
      const lineSize = Buffer.byteLength(line, "utf-8") + 1; // +1 for the newline

      if (
        currentRowCount >= maxRows ||
        currentFileSize + lineSize > maxFileSizeBytes
      ) {
        currentFileStream = createNewWriteStream();
      }

      currentFileStream.write(line + "\n");
      currentRowCount++;
      currentFileSize += lineSize;
    }

    if (currentFileStream) {
      currentFileStream.end();
    }
    console.log(`Splitting complete! Files created in ${outputDir}`);
  } catch (error) {
    console.error(`Error splitting JSONL: ${(error as Error).message}`);
    throw new IngestError("Error splitting JSONL");
  }

  return { filePaths: outputFilePaths };
}
