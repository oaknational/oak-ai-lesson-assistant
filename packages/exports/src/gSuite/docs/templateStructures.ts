import { aiLogger } from "@oakai/logger";

import type { docs_v1 } from "@googleapis/docs";

import type { QuestionTemplate } from "./questionTemplateSchema";
import { QuestionTemplatesSchema } from "./questionTemplateSchema";
import questionTemplatesJson from "./questionTemplates.json";
import { generateCompleteTableRequests } from "./tableUtils";

const log = aiLogger("exports");

// Parse and validate templates on demand
function getQuestionTemplates(): QuestionTemplate[] {
  try {
    return QuestionTemplatesSchema.parse(questionTemplatesJson);
  } catch (error) {
    log.error("Failed to parse question templates", error);
    throw new Error("Invalid question templates structure", { cause: error });
  }
}

// Helper to get a specific template
export function getQuestionTemplate(
  type: string,
): QuestionTemplate | undefined {
  const templates = getQuestionTemplates();
  const templateName = `TEMPLATE-${type.toUpperCase()}`;
  return templates.find((t) => t.tabName === templateName);
}

/**
 * Replaces placeholders in text content with actual values
 */
function replacePlaceholdersInText(
  text: string,
  replacements: Record<string, string>,
): string {
  let result = text;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      value,
    );
  }
  return result;
}

/**
 * Deep clones a structural element and replaces placeholders in all text content
 */
function cloneAndReplacePlaceholders(
  element: docs_v1.Schema$StructuralElement,
  replacements: Record<string, string>,
): docs_v1.Schema$StructuralElement {
  // Deep clone the element
  const cloned = JSON.parse(
    JSON.stringify(element),
  ) as docs_v1.Schema$StructuralElement;

  // Replace placeholders in text runs
  if (cloned.paragraph?.elements) {
    for (const elem of cloned.paragraph.elements) {
      if (elem.textRun?.content) {
        elem.textRun.content = replacePlaceholdersInText(
          elem.textRun.content,
          replacements,
        );
      }
    }
  }

  // Replace placeholders in table cells
  if (cloned.table?.tableRows) {
    for (const row of cloned.table.tableRows) {
      if (row.tableCells) {
        for (const cell of row.tableCells) {
          if (cell.content) {
            for (const cellElement of cell.content) {
              if (cellElement.paragraph?.elements) {
                for (const elem of cellElement.paragraph.elements) {
                  if (elem.textRun?.content) {
                    elem.textRun.content = replacePlaceholdersInText(
                      elem.textRun.content,
                      replacements,
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return cloned;
}

/**
 * Converts template structural elements into insert requests
 */
export function generateInsertRequests(
  template: QuestionTemplate,
  replacements: Record<string, string>,
  insertIndex: number,
): docs_v1.Schema$Request[] {
  const requests: docs_v1.Schema$Request[] = [];

  // Process each element in the template
  for (const element of template.content) {
    // Skip section breaks as they're not needed in the output
    if (element.sectionBreak) {
      continue;
    }

    // Clone and replace placeholders
    const processedElement = cloneAndReplacePlaceholders(element, replacements);

    if (processedElement.paragraph) {
      // For paragraphs, extract the text and insert it
      const text =
        processedElement.paragraph.elements
          ?.map((e) => e.textRun?.content || "")
          .join("") || "";

      if (text.trim()) {
        requests.push({
          insertText: {
            // location: { index: insertIndex },
            endOfSegmentLocation: {},
            text: text,
          },
        });
      }
    } else if (processedElement.table) {
      // Generate proper table requests instead of converting to text
      const tableRequests = generateCompleteTableRequestsWithEndLocation(
        processedElement.table,
        replacements,
      );
      requests.push(...tableRequests);
    }
  }

  return requests;
}
