import type { SlideContent } from "../slides/extraction/types";

/**
 * Simplified slide content for LLM prompts.
 * Fields are optional to allow intent-specific filtering.
 */
export interface SimplifiedSlideContent {
  slideNumber: number;
  slideId: string;
  slideTitle?: string;
  textElements?: { id: string; content: string }[];
  tables?: {
    id: string;
    rows: number;
    columns: number;
    cells: { id: string; content: string }[][];
  }[];
  images?: { id: string; description: string }[];
  shapes?: { id: string; description: string }[];
  keyLearningPoints?: string[];
  learningCycles?: string[];
  coversDiversity?: boolean;
  slideType?: string;
}

export interface FormatSlidesOptions {
  /**
   * When true (default), text elements and table cells are prefixed with their
   * element IDs. Required for editing agents that need to reference specific
   * elements. Set to false for classification/analysis agents where IDs add
   * noise without value.
   */
  includeElementIds?: boolean;
}

/**
 * Format slides in a readable structure for LLM prompts
 * @param slides - Array of slide content to format
 * @param options - Formatting options
 * @returns Formatted string representation of slides
 */
export function formatSlidesForPrompt(
  slides: SimplifiedSlideContent[],
  options: FormatSlidesOptions = {},
): string {
  const { includeElementIds = true } = options;

  return slides
    .map((slide) => {
      const parts = [`## Slide ${slide.slideNumber} [${slide.slideId}]`];

      if (slide.slideTitle) {
        parts.push(`- Title: ${slide.slideTitle}`);
      }
      if (slide.slideType && slide.slideType !== "unclassified") {
        parts.push(`- Slide Type: ${slide.slideType}`);
      }

      if (slide.keyLearningPoints && slide.keyLearningPoints.length > 0) {
        parts.push(
          `- Key Learning Points: ${slide.keyLearningPoints.join("; ")}`,
        );
      }
      if (slide.learningCycles && slide.learningCycles.length > 0) {
        parts.push(`- Learning Cycles: ${slide.learningCycles.join("; ")}`);
      }
      if (slide.coversDiversity) {
        parts.push(`- Covers Diversity: yes`);
      }

      // Filter out text elements that are entirely whitespace (empty placeholders).
      // This only affects what the LLM sees — the original slide data is unchanged.
      const textElements = (slide.textElements ?? []).filter(
        (te) => te.content.trim().length > 0,
      );
      const tables = slide.tables ?? [];

      if (textElements.length > 0) {
        if (includeElementIds) {
          parts.push(
            `\n### Text Content (preserve all whitespace, including newlines and spacing):`,
            ...textElements.map(
              (te) => `Text element [${te.id}]: ${te.content}`,
            ),
          );
        } else {
          parts.push(
            `\n### Text Content:`,
            ...textElements.map((te) => te.content),
          );
        }
      }

      if (tables.length > 0) {
        parts.push(`\n### Tables:`);
        tables.forEach((table, tableIdx) => {
          if (includeElementIds) {
            parts.push(
              `\nTable ${tableIdx + 1} [${table.id}] (${table.rows}×${table.columns}):`,
              `| Cell ID & Content |`,
              `| --- | --- | --- |`,
            );
            table.cells.forEach((row) => {
              const rowContent = row
                .map((cell) => `[${cell.id}]${cell.content}`)
                .join(" | ");
              parts.push(`| ${rowContent} |`);
            });
          } else {
            parts.push(
              `\nTable ${tableIdx + 1} (${table.rows}×${table.columns}):`,
              `| ${table.cells[0]?.map(() => "").join(" | ") ?? ""} |`,
              `| --- |`,
            );
            table.cells.forEach((row) => {
              const rowContent = row.map((cell) => cell.content).join(" | ");
              parts.push(`| ${rowContent} |`);
            });
          }
        });
      }

      if (textElements.length === 0 && tables.length === 0) {
        parts.push(`- No text content`);
      }

      if (slide.images && slide.images.length > 0) {
        parts.push(`\n### Images:`);
        slide.images.forEach((img) => {
          if (includeElementIds) {
            parts.push(`- Image [${img.id}]: ${img.description}`);
          } else {
            parts.push(`- Image: ${img.description}`);
          }
        });
      }

      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}

/**
 * Simplify slide content for LLM prompts by extracting only text and table data
 * @param slides - Full slide content array
 * @returns Simplified slide content array
 */
export function simplifySlideContent(
  slides: SlideContent[],
): SimplifiedSlideContent[] {
  return slides.map((slide) => ({
    slideNumber: slide.slideNumber,
    slideId: slide.slideId,
    slideTitle: slide.slideTitle,
    slideType: slide.slideType,
    textElements: slide.textElements,
    tables: slide.tables,
    images: slide.nonTextElements
      ?.filter((e) => e.type === "image")
      .map((e) => ({ id: e.id, description: e.description })),
  }));
}
