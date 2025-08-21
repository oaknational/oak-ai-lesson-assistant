# Export Scripts

Scripts for generating assets and resources used by the export system.

## Answer Box Generation

### `generate-answer-box.ts`

Generates the answer box image used in quiz tables for Google Docs exports.

**Purpose:**
Google Docs can't embed SVG images, so this script generates a high-quality PNG from an SVG definition and uploads it to GCS for use in quiz exports.

**When to run:**
- Changing the design/appearance of answer boxes
- Setting up a new environment (populating the GCS bucket)

**How to run:**
```bash
pnpm with-env tsx scripts/generate-answer-box.ts
```

**What it does:**
1. Generates an SVG with a rounded rectangle border
2. Converts to PNG at 3x scale for sharpness
3. Saves locally to `scripts/outputs/answer-box.png`
4. Uploads to GCS bucket as `static/answer-box.png`

**Customization:**
Modify the SVG definition in the script to change the box appearance. The generated image is referenced in `constants.ts` as `ANSWER_BOX_IMAGE_URL`.