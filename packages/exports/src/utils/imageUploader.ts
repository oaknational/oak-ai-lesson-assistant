import { aiLogger } from "@oakai/logger";

import { generateLatexHash } from "../gSuite/docs/findLatexPatterns";

const log = aiLogger("exports");

// Cache for uploaded image URLs to avoid duplicate uploads
const uploadCache = new Map<string, string>();

export interface ImageUploadConfig {
  // Placeholder for future configuration options
  // Could include CDN endpoints, GCS bucket names, etc.
  baseUrl?: string;
}

/**
 * Upload a PNG buffer and return a public URL
 *
 * This is a placeholder implementation that needs to be connected
 * to an actual storage service (GCS, S3, CDN, etc.)
 *
 * For now, it returns a data URI which won't work with Google Docs API,
 * but allows us to test the rest of the pipeline.
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  _config?: ImageUploadConfig,
): Promise<string> {
  const cacheKey = filename;

  // Check cache first
  const cached = uploadCache.get(cacheKey);
  if (cached) {
    log.info(`Using cached URL for image: ${filename}`);
    return cached;
  }

  try {
    // TODO: Implement actual upload to a public storage service
    // Options:
    // 1. Google Cloud Storage with public bucket
    // 2. Existing Oak CDN infrastructure
    // 3. Cloudinary or similar image hosting service
    // 4. Upload to Google Drive and make public

    // For now, log a warning and return a placeholder
    log.warn(
      `Image upload not implemented. Would upload: ${filename} (${buffer.length} bytes)`,
    );

    // Create a placeholder URL that indicates this needs implementation
    const placeholderUrl = `https://placeholder.oak.ai/latex/${filename}`;

    // Cache the result
    uploadCache.set(cacheKey, placeholderUrl);

    return placeholderUrl;
  } catch (error) {
    log.error(`Failed to upload image: ${filename}`, error);
    throw new Error(
      `Image upload failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Upload a LaTeX-rendered PNG with an appropriate filename
 */
export async function uploadLatexImage(
  buffer: Buffer,
  latex: string,
  type: "inline" | "display",
  config?: ImageUploadConfig,
): Promise<string> {
  const hash = generateLatexHash(latex);
  const filename = `latex-${type}-${hash}.png`;

  return uploadImage(buffer, filename, config);
}

/**
 * Batch upload multiple images
 */
export async function batchUploadImages(
  images: Array<{
    buffer: Buffer;
    latex: string;
    type: "inline" | "display";
  }>,
  config?: ImageUploadConfig,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Process uploads in parallel
  const uploadPromises = images.map(async ({ buffer, latex, type }) => {
    try {
      const url = await uploadLatexImage(buffer, latex, type, config);
      const hash = generateLatexHash(latex);
      results.set(hash, url);
    } catch (error) {
      log.error(
        `Failed to upload image for LaTeX: ${latex.substring(0, 30)}...`,
        error,
      );
      // Don't throw - allow other uploads to complete
    }
  });

  await Promise.all(uploadPromises);

  log.info(`Batch uploaded ${results.size}/${images.length} images`);
  return results;
}

/**
 * Clear the upload cache (useful for testing)
 */
export function clearUploadCache(): void {
  uploadCache.clear();
  log.info("Cleared image upload cache");
}
