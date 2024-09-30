import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Combines all .jsonl files from a directory into a single .jsonl file.
 * @param inputDir - Directory containing the .jsonl files
 * @param outputFilePath - The path to the output .jsonl file
 */
export function combineJsonlFiles(
  inputDir: string,
  outputFilePath: string,
): void {
  try {
    // Get all files in the input directory
    const files = fs.readdirSync(inputDir);

    // Filter only .jsonl files
    const jsonlFiles = files.filter((file) => file.endsWith(".jsonl"));

    // Open output file for writing
    const writeStream = fs.createWriteStream(outputFilePath, { flags: "w" });

    // Read each file and append its content to the output file
    for (const file of jsonlFiles) {
      const filePath = path.join(inputDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      // Write file content to the output file with a newline
      writeStream.write(fileContent + "\n");
    }

    // Close the write stream
    writeStream.end();

    console.log(
      `Successfully combined ${jsonlFiles.length} .jsonl files into ${outputFilePath}`,
    );
  } catch (error) {
    // @ts-ignore
    console.error(`Error combining .jsonl files: ${error["message"]}`);
  }
}
