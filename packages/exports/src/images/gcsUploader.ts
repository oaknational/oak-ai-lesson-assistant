import { aiLogger } from "@oakai/logger";

import { Storage } from "@google-cloud/storage";

const log = aiLogger("exports");

// Bucket name for temporary LaTeX image storage
const LATEX_BUCKET_NAME = "oakai_playground_exports_tmp";

/**
 * Get Google Cloud Storage client
 * Uses Application Default Credentials (ADC)
 */
function getStorageClient(): Storage {
  // This will automatically use the service account attached to the Cloud Run service
  // or credentials from gcloud auth for local development
  return new Storage();
}

/**
 * Upload an image buffer to GCP bucket
 * @param buffer - The image buffer to upload
 * @param filename - The filename to use in the bucket
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToGCS(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  try {
    log.info(`Uploading image ${filename} to GCS bucket ${LATEX_BUCKET_NAME}`);

    const storage = getStorageClient();
    const bucket = storage.bucket(LATEX_BUCKET_NAME);
    const file = bucket.file(filename);

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: "image/png",
      },
      public: true, // Make the file publicly accessible
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${LATEX_BUCKET_NAME}/${filename}`;

    log.info(`Successfully uploaded ${filename} to ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    log.error(`Failed to upload image ${filename}`, error);
    throw new Error(`Image upload failed for ${filename}`, { cause: error });
  }
}

/**
 * Generate a unique filename for a LaTeX image
 * @param hash - The LaTeX content hash
 * @returns A filename like "latex-abc123.png"
 */
export function generateLatexImageFilename(hash: string): string {
  return `latex-${hash}.png`;
}

/**
 * Check if an image already exists in the bucket
 * @param filename - The filename to check
 * @returns The public URL if exists, null if not exists
 * @throws Error if unable to check existence
 */
export async function getExistingImageUrl(
  filename: string,
): Promise<string | null> {
  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(LATEX_BUCKET_NAME);
    const file = bucket.file(filename);

    const [exists] = await file.exists();
    if (exists) {
      const publicUrl = `https://storage.googleapis.com/${LATEX_BUCKET_NAME}/${filename}`;
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
