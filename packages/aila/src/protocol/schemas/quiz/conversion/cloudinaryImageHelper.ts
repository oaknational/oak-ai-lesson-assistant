import type { StemImageObject } from "../rawQuiz";

// Constrain to a 1200x1200 box
const sizeConstraints = "c_limit,h_1200,w_1200";

/**
 * Constrains image size by adding Cloudinary transformations to limit dimensions to 1200x1200
 * Preserves version numbers and existing transformations
 */
export function constrainImageUrl(url: string): string {
  if (!url.includes("cloudinary.com/image/upload")) {
    return url;
  }

  if (url.includes(sizeConstraints)) {
    return url;
  }

  return url.replace("/image/upload/", `/image/upload/${sizeConstraints}/`);
}

/**
 * Get a size-limited Cloudinary image URL from a StemImageObject
 * Uses the secure_url and applies size constraints
 */
export function getConstrainedStemImageUrl(imageStem: StemImageObject): string {
  return constrainImageUrl(imageStem.image_object.secure_url);
}
