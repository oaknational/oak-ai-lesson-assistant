import {
  deletePageElements,
  deleteSlides,
  replaceTableCellText,
  replaceTextElements,
} from "@oakai/gsuite";
import { aiLogger } from "@oakai/logger";

import type { AdaptationPlan } from "../schemas/plan";
import { parseCellId } from "../slides/extraction/parseCellId";

const log = aiLogger("adaptations");

/**
 * Result of executing slide changes.
 */
export interface ExecuteSlideChangesResult {
  /** IDs of changes that were successfully executed */
  executedChangeIds: string[];
  /** Error messages for any changes that failed */
  errors: string[];
}

/**
 * Executes all slide changes from an adaptation plan against a Google Slides presentation.
 *
 * Operations are applied in a safe order:
 * 1. Text replacements (textEdits + tableCellEdits) - elements still exist
 * 2. Element deletions (textElementDeletions) - after text edits are done
 * 3. Slide deletions (slideDeletions) - last, in reverse slide number order
 *
 * @param presentationId - The Google Slides presentation ID to modify
 * @param plan - The adaptation plan containing changes to execute
 * @returns Result with executed change IDs and any errors
 */
export async function executeSlideChanges(
  presentationId: string,
  plan: AdaptationPlan,
): Promise<ExecuteSlideChangesResult> {
  const executedChangeIds: string[] = [];
  const errors: string[] = [];
  const { changes } = plan.slidesAgentResponse;

  // 1. Apply text edits to regular text elements
  if (changes.textEdits.length > 0) {
    try {
      const replacements = changes.textEdits.map((edit) => ({
        objectId: edit.elementId,
        text: edit.newText,
      }));

      await replaceTextElements(presentationId, replacements);

      for (const edit of changes.textEdits) {
        executedChangeIds.push(edit.changeId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error(`Failed to apply text edits: ${message}`);
    }
  }

  // 2. Apply table cell edits
  if (changes.tableCellEdits.length > 0) {
    try {
      const replacements = changes.tableCellEdits
        .map((edit) => {
          const parsed = parseCellId(edit.cellId);
          if (!parsed) {
            errors.push(
              `Invalid table cell ID format: ${edit.cellId} (changeId: ${edit.changeId})`,
            );
            return null;
          }
          return {
            tableId: parsed.tableId,
            row: parsed.row,
            col: parsed.col,
            text: edit.newText,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (replacements.length > 0) {
        await replaceTableCellText(presentationId, replacements);

        for (const edit of changes.tableCellEdits) {
          if (parseCellId(edit.cellId)) {
            executedChangeIds.push(edit.changeId);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error(`Failed to apply table cell edits: ${message}`);
    }
  }

  // 3. Delete text elements
  if (changes.textElementDeletions.length > 0) {
    try {
      const elementIds = changes.textElementDeletions.map(
        (deletion) => deletion.elementId,
      );

      await deletePageElements(presentationId, elementIds);

      for (const deletion of changes.textElementDeletions) {
        executedChangeIds.push(deletion.changeId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error(`Failed to delete text elements: ${message}`);
    }
  }

  // 4. Delete slides (in reverse slide number order to avoid index shifts)
  if (changes.slideDeletions.length > 0) {
    try {
      const sortedDeletions = [...changes.slideDeletions].sort(
        (a, b) => b.slideNumber - a.slideNumber,
      );

      const slideIds = sortedDeletions.map((deletion) => deletion.slideId);

      await deleteSlides(presentationId, slideIds);

      for (const deletion of sortedDeletions) {
        executedChangeIds.push(deletion.changeId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error(`Failed to delete slides: ${message}`);
    }
  }

  return { executedChangeIds, errors };
}
