import { aiLogger } from "@oakai/logger";

import { Storage } from "@google-cloud/storage";

import { GCS_LATEX_BUCKET_NAME, gcsLatexCredentials } from "./gcsCredentials";

const log = aiLogger("exports");

function getStorageClient(): Storage {
  return new Storage({
    credentials: gcsLatexCredentials,
  });
}

/**
 * Upload an image buffer to GCS
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToGCS(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  try {
    log.info(
      `Uploading image ${filename} to GCS bucket ${GCS_LATEX_BUCKET_NAME}`,
    );

    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_LATEX_BUCKET_NAME);
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    const publicUrl = `https://storage.googleapis.com/${GCS_LATEX_BUCKET_NAME}/${filename}`;

    log.info(`Successfully uploaded ${filename} to ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    log.error(`Failed to upload image ${filename}`, error);
    throw new Error(`Image upload failed for ${filename}`, { cause: error });
  }
}

/**
 * Generate a filename for a LaTeX image
 * @returns A filename like "latex-abc123.png"
 */
export function generateLatexImageFilename(hash: string): string {
  return `latex-${hash}.png`;
}

/**
 * Check if an image already exists in GCS
 * @returns The public URL if exists, null if not exists
 */
export async function getExistingImageUrl(
  filename: string,
): Promise<string | null> {
  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(GCS_LATEX_BUCKET_NAME);
    const file = bucket.file(filename);

    const [exists] = await file.exists();
    if (exists) {
      const publicUrl = `https://storage.googleapis.com/${GCS_LATEX_BUCKET_NAME}/${filename}`;
      log.info(`Image already exists: ${publicUrl}`);
      return publicUrl;
    }
    return null;
  } catch (error) {
    log.error(`Error checking if image exists: ${filename}`, error);
    throw new Error(`Failed to check image existence for ${filename}`, {
      cause: error,
    });
  }
}
