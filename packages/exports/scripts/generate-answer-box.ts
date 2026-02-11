/* eslint-disable no-console */

/**
 * Generate answer box image and upload to GCS
 *
 * Google Docs can't embed SVG images, so we generate a high-quality PNG
 * from an SVG definition. The PNG is uploaded to GCS for use in quiz exports.
 *
 * Run this script when:
 * - Changing the design/appearance of answer boxes
 * - Setting up a new environment (populating the GCS bucket)
 */
import { Storage } from "@google-cloud/storage";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";

import { ANSWER_BOX_SIZE } from "../src/gSuite/docs/quiz/table-generators/constants";
import {
  GCS_LATEX_BUCKET_NAME,
  gcsLatexCredentials,
} from "../src/images/gcsCredentials";

const ZOOM_SCALE = 3;

async function generateAnswerBox() {
  // Empty answer box SVG with border, transparent background
  const svg = `<svg width="${ANSWER_BOX_SIZE}" height="${ANSWER_BOX_SIZE}" viewBox="0 0 ${ANSWER_BOX_SIZE} ${ANSWER_BOX_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect 
    x="1" 
    y="1" 
    width="26" 
    height="26" 
    rx="3" 
    ry="3"
    fill="none"
    stroke="#222222"
    stroke-width="2"
  />
</svg>`;

  console.log("Generating answer box PNG...");
  console.log("\nSVG content:");
  console.log(svg);

  // Also save SVG for inspection
  await fs.mkdir("scripts/outputs", { recursive: true });
  await fs.writeFile("scripts/outputs/answer-box.svg", svg);
  console.log("SVG saved to scripts/outputs/answer-box.svg");

  // Convert to PNG at higher scale for better quality
  const resvg = new Resvg(svg, {
    background: "rgba(255, 255, 255, 0)",
    fitTo: { mode: "zoom", value: ZOOM_SCALE },
  });
  const pngBuffer = Buffer.from(resvg.render().asPng());

  // Save locally
  await fs.mkdir("scripts/outputs", { recursive: true });
  await fs.writeFile("scripts/outputs/answer-box.png", pngBuffer);

  console.log("✅ Generated PNG locally");
  console.log(`   Size: ${pngBuffer.length} bytes`);
  console.log(`   Path: scripts/outputs/answer-box.png`);

  // Upload to GCS
  try {
    const filename = "static/answer-box.png";

    console.log(`\nUploading to GCS bucket ${GCS_LATEX_BUCKET_NAME}...`);

    const storage = new Storage({
      credentials: gcsLatexCredentials,
    });
    const bucket = storage.bucket(GCS_LATEX_BUCKET_NAME);
    const file = bucket.file(filename);

    await file.save(pngBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    const publicUrl = file.publicUrl();
    console.log("☁️  Uploaded to GCS:");
    console.log(`   URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.log("\n⚠️  GCS upload failed (this is okay for local testing)");
    console.log(`   ${String(error)}`);
  }
}

generateAnswerBox().catch(console.error);
