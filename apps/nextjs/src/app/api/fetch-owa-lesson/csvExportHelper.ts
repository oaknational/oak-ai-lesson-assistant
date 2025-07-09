import { aiLogger } from "@oakai/logger";

import { type SyntheticUnitvariantLessonsByKs } from "@oaknational/oak-curriculum-schema";
import fs from "fs";
import path from "path";

import { type LessonContentSchema } from "./lessonOverview.schema";

const log = aiLogger("additional-materials");

type LessonOverviewResponse = {
  data?: {
    content?: LessonContentSchema[];
    browseData?: SyntheticUnitvariantLessonsByKs[];
  };
};

// Function to escape CSV values
function escapeCSVValue(value: string): string {
  // If the value contains quotes, escape them by doubling them
  if (value.includes('"')) {
    value = value.replace(/"/g, '""');
  }
  // If the value contains commas, newlines, or quotes, wrap it in quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    value = `"${value}"`;
  }
  return value;
}

// Function to export data to CSV
export function exportToCSV(data: LessonOverviewResponse["data"]): void {
  log.info("Starting CSV export...");
  try {
    const csvRows: string[] = [];
    let filteredRowCount = 0;

    // CSV header
    csvRows.push("lesson_slug,unit_slug,programme_slug,features");
    log.info("CSV header added.");

    // Process the data
    if (data?.browseData) {
      log.info(`Processing ${data.browseData.length} browseData items.`);
      data.browseData.forEach((item) => {
        // Check if any of the required feature flags are true
        const features = item.features as Record<string, unknown>;
        const hasRestrictedFeatures =
          features &&
          (features["agf__geo_restricted"] === true ||
            features["agf__login_required"] === true ||
            features["agf__restricted_download"] === true ||
            features["agf__has_copyright_restrictions"] === true);

        if (hasRestrictedFeatures) {
          const lessonSlug = escapeCSVValue(String(item.lesson_slug || ""));
          const unitSlug = escapeCSVValue(String(item.unit_slug || ""));
          const programmeSlug = escapeCSVValue(
            String(item.programme_slug || ""),
          );
          const featuresJson = escapeCSVValue(
            JSON.stringify(item.features ?? {}),
          );

          csvRows.push(
            `${lessonSlug},${unitSlug},${programmeSlug},${featuresJson}`,
          );
          filteredRowCount++;
          log.info(
            `Processed restricted row ${filteredRowCount}: ${lessonSlug},${unitSlug},${programmeSlug}`,
          );
        }
      });
    } else {
      log.warn("No browseData found to export.");
    }

    // Only write to file if we have filtered rows (excluding header)
    if (filteredRowCount > 0) {
      const csvContent = csvRows.join("\n");

      // Write to file
      const filePath = path.join(process.cwd(), "copyright_lessons_export.csv");
      fs.writeFileSync(filePath, csvContent, "utf8");

      log.info(
        `CSV export completed with ${filteredRowCount} restricted items: ${filePath}`,
      );
    } else {
      log.info(
        "No items with copyright restrictions found. CSV file not created.",
      );
    }
  } catch (error) {
    log.error("Error exporting to CSV:", error);
  }
}
