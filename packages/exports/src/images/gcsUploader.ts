import { aiLogger } from "@oakai/logger";

import { Storage } from "@google-cloud/storage";

import { GCS_LATEX_BUCKET_NAME, gcsLatexCredentials } from "./gcsCredentials";

const log = aiLogger("exports");

// Constants
const LATEX_PREFIX = "latex/";

// Reuse a single Storage client instance
const storage = new Storage({
  credentials: gcsLatexCredentials,
});

interface UploadImageParams {
  buffer: Buffer;
  latexHash: string;
  width: number;
  height: number;
}

/**
 * Upload an image buffer to GCS
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToGCS({
  buffer,
  latexHash,
  width,
  height,
}: UploadImageParams): Promise<string> {
  const filename = generateLatexImageFilename(latexHash, width, height);
  try {
    const bucket = storage.bucket(GCS_LATEX_BUCKET_NAME);
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    const publicUrl = file.publicUrl();
    return publicUrl;
  } catch (error) {
    log.error(`Failed to upload image ${filename}`, error);
    throw new Error(`Image upload failed for ${filename}`, { cause: error });
  }
}

/**
 * Generate a filename for a LaTeX image
 * @returns A filename like "latex/abc123-100x100.png"
 */
function generateLatexImageFilename(
  hash: string,
  width: number,
  height: number,
): string {
  return `${LATEX_PREFIX}${hash}-${width}x${height}.png`;
}

/**
 * Check if an image already exists in GCS
 * @returns The public URL if exists, null if not exists
 */
export async function getExistingImageUrl(
  hash: string,
): Promise<string | null> {
  try {
    const bucket = storage.bucket(GCS_LATEX_BUCKET_NAME);

    const [files] = await bucket.getFiles({
      prefix: `${LATEX_PREFIX}${hash}-`,
      maxResults: 1,
    });

    if (files[0]) {
      return files[0].publicUrl();
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to check image existence for ${hash}`, {
      cause: error,
    });
  }
}
