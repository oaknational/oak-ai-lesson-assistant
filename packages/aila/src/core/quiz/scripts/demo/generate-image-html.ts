#!/usr/bin/env tsx

/**
 * Generate HTML visualization of image descriptions
 *
 * Usage (from packages/aila directory):
 *   pnpm with-env tsx src/core/quiz/scripts/generate-image-html.ts > image-descriptions.html
 */
import { aiLogger } from "@oakai/logger";
import * as fs from "fs";

import { CircleTheoremLesson } from "../../fixtures/CircleTheoremsExampleOutput";
import { MLQuizGeneratorMultiTerm } from "../../generators/MLQuizGeneratorMultiTerm";
import { ImageDescriptionService } from "../../services/ImageDescriptionService";

const log = aiLogger("aila:quiz");

async function generateHTML() {
  const generator = new MLQuizGeneratorMultiTerm();
  const pools = await generator.generateMathsExitQuizCandidates(CircleTheoremLesson);

  const poolsWithImages = pools.filter((pool) =>
    pool.questions.some((q) => q.question.question.includes("![image](")),
  );

  const testPools = poolsWithImages.length > 0 ? poolsWithImages : pools;

  const imageService = new ImageDescriptionService();
  const { descriptions } = await imageService.getImageDescriptions(testPools);

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Image Descriptions - AI Generated</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
            color: #333;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 40px;
        }
        .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
        }
        .image-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .image-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .image-number {
            font-size: 14px;
            font-weight: 600;
            color: #3498db;
            margin-bottom: 12px;
        }
        .image-container {
            width: 100%;
            height: 300px;
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .image-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .description {
            font-size: 15px;
            line-height: 1.6;
            color: #2c3e50;
            margin-bottom: 16px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #3498db;
        }
        .url {
            font-size: 11px;
            color: #7f8c8d;
            word-break: break-all;
            padding: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
        }
        .stats {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stats h2 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .stats p {
            color: #7f8c8d;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <h1>Quiz Image Descriptions</h1>
    <div class="subtitle">AI-Generated Pedagogical Descriptions Using GPT-4o-mini</div>

    <div class="stats">
        <h2>System Information</h2>
        <p><strong>Total Images:</strong> ${descriptions.size} unique images processed</p>
        <p><strong>Model:</strong> GPT-4o-mini with structured outputs (zodResponseFormat)</p>
        <p><strong>Cache Strategy:</strong> 90-day Redis cache with batch mget operations</p>
        <p><strong>Rate Limiting:</strong> 10 concurrent vision API calls using p-limit</p>
        <p><strong>Focus:</strong> Mathematical content (angles, points, theorems) not visual style</p>
    </div>

    <div class="image-grid">
${Array.from(descriptions.entries())
  .map(
    ([url, description], i) => `        <div class="image-card">
            <div class="image-number">Image ${i + 1}</div>
            <div class="image-container">
                <img src="${url}" alt="Mathematics diagram ${i + 1}" loading="lazy">
            </div>
            <div class="description">
                ${description}
            </div>
            <div class="url">${url}</div>
        </div>`,
  )
  .join("\n\n")}
    </div>
</body>
</html>`;

  // Write to file
  fs.writeFileSync("image-descriptions.html", html);
  log.info(`Generated HTML with ${descriptions.size} images`);
  log.info("Saved to: image-descriptions.html");
}

generateHTML().catch((error) => {
  log.error("Failed to generate HTML:", error);
  process.exit(1);
});
