/**
 * Generates TypeScript types from the Oak Moderation Service OpenAPI spec.
 *
 * Usage:
 *   pnpm codegen:moderation
 *
 * Requires MODERATION_API_URL environment variable to be set.
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODERATION_API_URL = process.env.MODERATION_API_URL;

if (!MODERATION_API_URL) {
  console.error(
    "Error: MODERATION_API_URL environment variable is not set.\n" +
      "Please set it to the base URL of the moderation service.\n" +
      "Example: MODERATION_API_URL=https://moderation-api.thenational.academy",
  );
  process.exit(1);
}

const openApiUrl = `${MODERATION_API_URL}/openapi.json`;
const outputPath = path.resolve(__dirname, "../generated/moderation-api.d.ts");

console.log(`Fetching OpenAPI spec from: ${openApiUrl}`);
console.log(`Output path: ${outputPath}`);

try {
  execSync(`curl -sf "${openApiUrl}" | openapi-typescript /dev/stdin -o "${outputPath}"`, {
    stdio: "inherit",
    shell: "/bin/bash",
  });
  console.log("Types generated successfully!");
} catch (error) {
  console.error("Failed to generate types:", error);
  process.exit(1);
}
