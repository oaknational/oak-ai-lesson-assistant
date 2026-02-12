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
}

/**
 * Format slides in a readable structure for LLM prompts
 * @param slides - Array of slide content to format
 * @returns Formatted string representation of slides
 */
export function formatSlidesForPrompt(
  slides: SimplifiedSlideContent[],
): string {
  return slides
    .map((slide) => {
      const parts = [
        `## Slide ${slide.slideNumber}`,
        `- Slide ID: ${slide.slideId}`,
      ];

      if (slide.slideTitle) {
        parts.push(`- Title: ${slide.slideTitle}`);
      }

      const textElements = slide.textElements ?? [];
      const tables = slide.tables ?? [];

      if (textElements.length > 0) {
        parts.push(
          `\n### Text Content (preserve all whitespace, including newlines and spacing):`,
          ...textElements.map((te) => `Text element [${te.id}]: ${te.content}`),
        );
      }

      if (tables.length > 0) {
        parts.push(`\n### Tables:`);
        tables.forEach((table, tableIdx) => {
          parts.push(
            `\nTable ${tableIdx + 1} [${table.id}] (${table.rows}×${table.columns}):`,
          );
          table.cells.forEach((row) => {
            const rowContent = row
              .map((cell) => `[${cell.id}]${cell.content}`)
              .join(" | ");
            parts.push(`  ${rowContent}`);
          });
        });
      }

      if (textElements.length === 0 && tables.length === 0) {
        parts.push(`- No text content`);
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
    textElements: slide.textElements,
    tables: slide.tables,
  }));
}
