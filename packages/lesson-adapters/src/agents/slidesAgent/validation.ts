import { aiLogger } from "@oakai/logger";

import type { SlidesAgentResponse } from "../../schemas/plan";
import type { SlideContent } from "../../slides/extraction/types";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Builds sets of valid IDs from the input slides and filters out any
 * changes in the LLM output that reference non-existent elements.
 * This prevents hallucinated IDs from reaching the Google Slides API.
 */
export function validateAgentOutput(
  output: SlidesAgentResponse,
  inputSlides: SlideContent[],
): SlidesAgentResponse {
  const validElementIds = new Set<string>();
  const validSlideIds = new Set<string>();
  const validCellIds = new Set<string>();

  for (const slide of inputSlides) {
    validSlideIds.add(slide.slideId);
    for (const te of slide.textElements) {
      validElementIds.add(te.id);
    }
    for (const table of slide.tables) {
      for (const row of table.cells) {
        for (const cell of row) {
          validCellIds.add(cell.id);
        }
      }
    }
  }

  const textEdits = output.changes.textEdits.filter((edit) => {
    if (!validElementIds.has(edit.elementId)) {
      log.warn(
        `Filtering out text edit with invalid elementId: "${edit.elementId}" (changeId: ${edit.changeId})`,
      );
      return false;
    }
    return true;
  });

  const tableCellEdits = output.changes.tableCellEdits.filter((edit) => {
    if (!validCellIds.has(edit.cellId)) {
      log.warn(
        `Filtering out table cell edit with invalid cellId: "${edit.cellId}" (changeId: ${edit.changeId})`,
      );
      return false;
    }
    return true;
  });

  const textElementDeletions = output.changes.textElementDeletions.filter(
    (deletion) => {
      if (!validElementIds.has(deletion.elementId)) {
        log.warn(
          `Filtering out text element deletion with invalid elementId: "${deletion.elementId}" (changeId: ${deletion.changeId})`,
        );
        return false;
      }
      return true;
    },
  );

  const slideDeletions = output.changes.slideDeletions.filter((deletion) => {
    if (!validSlideIds.has(deletion.slideId)) {
      log.warn(
        `Filtering out slide deletion with invalid slideId: "${deletion.slideId}" (changeId: ${deletion.changeId})`,
      );
      return false;
    }
    return true;
  });

  const totalOriginal =
    output.changes.textEdits.length +
    output.changes.tableCellEdits.length +
    output.changes.textElementDeletions.length +
    output.changes.slideDeletions.length;

  const totalValid =
    textEdits.length +
    tableCellEdits.length +
    textElementDeletions.length +
    slideDeletions.length;

  const filteredCount = totalOriginal - totalValid;

  if (filteredCount > 0) {
    log.warn(
      `Filtered out ${filteredCount}/${totalOriginal} changes with invalid IDs`,
    );
  }

  return {
    ...output,
    changes: {
      textEdits,
      tableCellEdits,
      textElementDeletions,
      slideDeletions,
      slidesToKeep: output.changes.slidesToKeep,
    },
  };
}
