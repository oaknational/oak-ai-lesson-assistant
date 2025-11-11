import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";

import { kv } from "@vercel/kv";
import { zodResponseFormat } from "openai/helpers/zod";
import pLimit from "p-limit";
import { z } from "zod";

import type { QuizQuestionPool } from "../interfaces";

const log = aiLogger("aila:quiz");

const CACHE_PREFIX = "quiz:image-description:";
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const VISION_MODEL = "gpt-4o-mini";
const RATE_LIMIT = 10; // Max concurrent vision API calls

const IMAGE_DESCRIPTION_PROMPT = `You are analyzing an image from a mathematics quiz question for UK secondary school students.

Generate a concise description focusing on:
- Mathematical elements (numbers, variables, equations, shapes)
- Key relationships (e.g., "angle ABC is marked as 45°")
- What mathematical concept is illustrated
- Labels and annotations that are directly shown on the image

DO NOT describe colours, layout, or design.
DO NOT measure elements like bar chart columns, even if a scale is present
DO focus on mathematical content.

Keep to 1-2 sentences maximum.

Good examples:
- "A right triangle with sides labeled 3cm, 4cm, and hypotenuse x"
- "A bar chart for categories walk, car, and bus"
- "A circle with angle AOB marked as 76°"

Bad examples:
- "A bar chart with walk at 12, car at 10"
- "A colourful diagram with shapes on white background"`;

const ImageDescriptionSchema = z.object({
  description: z
    .string()
    .describe("Concise mathematical description of the image"),
});

export interface ImageDescriptionMap {
  descriptions: Map<string, string>;
  cacheHits: number;
  cacheMisses: number;
  generatedCount: number;
}

/**
 * Service for managing image descriptions with KV caching
 *
 * Extracts images from quiz questions, generates pedagogical descriptions
 * using vision LLM, and caches them in Redis for 90 days.
 */
export class ImageDescriptionService {
  /**
   * Extract all unique image URLs from question pools
   */
  private extractImageUrls(questionPools: QuizQuestionPool[]): string[] {
    const urlSet = new Set<string>();

    for (const pool of questionPools) {
      for (const question of pool.questions) {
        this.extractUrlsFromText(question.question, urlSet);

        question.answers.forEach((answer) => {
          this.extractUrlsFromText(answer, urlSet);
        });

        question.distractors.forEach((distractor) => {
          this.extractUrlsFromText(distractor, urlSet);
        });
      }
    }

    return Array.from(urlSet);
  }

  /**
   * Extract image URLs from markdown text
   */
  private extractUrlsFromText(text: string, urlSet: Set<string>): void {
    const imageRegex = /!\[[^\]]*\]\(([^)]{1,2000})\)/g;

    [...text.matchAll(imageRegex)]
      .map((match) => match[1])
      .filter((url): url is string => Boolean(url))
      .forEach((url) => urlSet.add(url));
  }

  /**
   * Get descriptions from cache using batch mget
   */
  private async getCachedDescriptions(
    urls: string[],
  ): Promise<Map<string, string>> {
    if (urls.length === 0) {
      return new Map();
    }

    const keys = urls.map((url) => `${CACHE_PREFIX}${url}`);

    try {
      const values = await kv.mget<string[]>(...keys);

      const cached = new Map<string, string>();
      urls.forEach((url, index) => {
        const value = values[index];
        if (value) {
          cached.set(url, value);
        }
      });

      return cached;
    } catch (error) {
      log.error("Failed to fetch cached descriptions:", error);
      return new Map();
    }
  }

  /**
   * Generate description for a single image using vision LLM
   */
  private async generateDescription(imageUrl: string): Promise<string> {
    const openai = createOpenAIClient({ app: "maths-quiz-images" });

    try {
      const response = await openai.beta.chat.completions.parse({
        model: VISION_MODEL,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: IMAGE_DESCRIPTION_PROMPT,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        response_format: zodResponseFormat(
          ImageDescriptionSchema,
          "ImageDescription",
        ),
      });

      const description = response.choices[0]?.message?.parsed?.description;

      if (!description) {
        throw new Error("No description generated");
      }

      return description;
    } catch (error) {
      log.error(`Failed to generate description for ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Generate descriptions for multiple images with rate limiting
   */
  private async generateDescriptions(
    urls: string[],
  ): Promise<Map<string, string>> {
    if (urls.length === 0) {
      return new Map();
    }

    log.info(`Generating descriptions for ${urls.length} images...`);

    const limit = pLimit(RATE_LIMIT);

    const results = await limit.map(urls, async (url) => {
      try {
        const description = await this.generateDescription(url);
        log.info(`Generated description for ${url.substring(0, 60)}...`);
        return [url, description] as const;
      } catch (error) {
        log.warn(`Skipping ${url} due to error:`, error);
        return null;
      }
    });

    const descriptions = new Map<string, string>();
    results.forEach((result) => {
      if (result) {
        descriptions.set(result[0], result[1]);
      }
    });

    return descriptions;
  }

  /**
   * Store descriptions in cache with TTL
   */
  private async cacheDescriptions(
    descriptions: Map<string, string>,
  ): Promise<void> {
    if (descriptions.size === 0) {
      return;
    }

    const promises = Array.from(descriptions.entries()).map(
      ([url, description]) =>
        kv.set(`${CACHE_PREFIX}${url}`, description, {
          ex: CACHE_TTL_SECONDS,
        }),
    );

    try {
      await Promise.all(promises);
      log.info(`Cached ${descriptions.size} new descriptions`);
    } catch (error) {
      log.error("Failed to cache descriptions:", error);
    }
  }

  /**
   * Get or generate descriptions for all images in question pools
   *
   * @param questionPools - The question pools to extract images from
   * @returns Map of image URL to description, plus cache statistics
   */
  public async getImageDescriptions(
    questionPools: QuizQuestionPool[],
  ): Promise<ImageDescriptionMap> {
    const imageUrls = this.extractImageUrls(questionPools);

    if (imageUrls.length === 0) {
      log.info("No images found in question pools");
      return {
        descriptions: new Map(),
        cacheHits: 0,
        cacheMisses: 0,
        generatedCount: 0,
      };
    }

    log.info(`Found ${imageUrls.length} unique images`);

    // Check cache
    const cached = await this.getCachedDescriptions(imageUrls);
    const cacheHits = cached.size;
    const cacheMisses = imageUrls.length - cacheHits;

    log.info(`Cache: ${cacheHits} hits, ${cacheMisses} misses`);

    // Generate descriptions for cache misses
    const uncachedUrls = imageUrls.filter((url) => !cached.has(url));
    const generated = await this.generateDescriptions(uncachedUrls);

    // Cache new descriptions
    await this.cacheDescriptions(generated);

    // Combine cached and generated
    const allDescriptions = new Map([...cached, ...generated]);

    return {
      descriptions: allDescriptions,
      cacheHits,
      cacheMisses,
      generatedCount: generated.size,
    };
  }

  /**
   * Replace markdown images with text descriptions in a string
   *
   * @param text - Text containing markdown images
   * @param descriptions - Map of URL to description
   * @returns Text with images replaced by descriptions
   */
  public static replaceImagesWithDescriptions(
    text: string,
    descriptions: Map<string, string>,
  ): string {
    return text.replace(
      /!\[([^\]]*)\]\(([^)]{1,2000})\)/g,
      (match, _alt, url: string) => {
        const description = descriptions.get(url);
        return description ? `[IMAGE: ${description}]` : match;
      },
    );
  }

  /**
   * Apply image description replacement to all questions in pools
   *
   * @param questionPools - Question pools to process
   * @param descriptions - Map of URL to description
   * @returns New question pools with images replaced by descriptions
   */
  public static applyDescriptionsToQuestions(
    questionPools: QuizQuestionPool[],
    descriptions: Map<string, string>,
  ): QuizQuestionPool[] {
    return questionPools.map((pool) => ({
      ...pool,
      questions: pool.questions.map((question) => ({
        ...question,
        question: this.replaceImagesWithDescriptions(
          question.question,
          descriptions,
        ),
        answers: question.answers.map((answer) =>
          this.replaceImagesWithDescriptions(answer, descriptions),
        ),
        distractors: question.distractors.map((distractor) =>
          this.replaceImagesWithDescriptions(distractor, descriptions),
        ),
      })),
    }));
  }
}
