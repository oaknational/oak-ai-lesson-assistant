import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("adaptations");

/**
 * Generates AI image descriptions for slide images using GPT-4o Vision.
 * Returns a map of objectId -> description string.
 */
export async function generateImageDescriptions(
  images: Array<{ objectId: string; contentUrl: string; title?: string }>,
  presentationTitle?: string,
): Promise<Record<string, string>> {
  if (images.length === 0) {
    log.info("No images to describe, skipping GPT-4o Vision call");
    return {};
  }

  const openai = createOpenAIClient({
    app: "image-alt-text",
  });

  log.info("Generating image descriptions with GPT-4o Vision", {
    imageCount: images.length,
    presentationTitle,
  });

  const descriptionPromises = images.map(async (image) => {
    try {
      const contextPrompt = presentationTitle
        ? `This image is from an educational presentation titled "${presentationTitle}".`
        : "This is an educational slide image.";

      const titleContext = image.title
        ? ` The image is titled "${image.title}".`
        : "";

      const promptText = `${contextPrompt}${titleContext} Describe this image concisely in 1-2 sentences, focusing on educational content (diagrams, charts, labels, key information). If there's text in the image, mention the key points. If the image has no educational value or is a shape or icon that could not be linked to any key learning point of the lesson return an empty string not a sentence.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 150,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: {
                  url: image.contentUrl,
                  detail: "low",
                },
              },
            ],
          },
        ],
      });

      const description =
        response.choices[0]?.message.content?.trim() || image.title || "Image";
      log.info("Generated image description", {
        objectId: image.objectId,
        title: image.title,
        description,
      });
      return { objectId: image.objectId, description };
    } catch (error) {
      log.error("Failed to generate description for image", {
        objectId: image.objectId,
        error,
      });
      return {
        objectId: image.objectId,
        description: image.title || "Image",
      };
    }
  });

  const results = await Promise.all(descriptionPromises);

  const descriptions: Record<string, string> = {};
  results.forEach(({ objectId, description }) => {
    descriptions[objectId] = description;
  });

  log.info("Image description generation complete", {
    total: images.length,
    described: Object.values(descriptions).filter((d) => d !== "Image").length,
  });

  return descriptions;
}
