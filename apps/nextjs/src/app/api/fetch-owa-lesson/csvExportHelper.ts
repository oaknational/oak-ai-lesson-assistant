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

type LessonItem = {
  slug: string;
  features: Record<string, unknown>;
  _state: string;
  copyright_content?: Record<string, unknown>;
};

// Function to export lessons array to CSV
export function exportLessonsToCSV(lessons: LessonItem[]): void {
  log.info("Starting lessons CSV export...");
  try {
    const csvRows: string[] = [];

    // CSV header
    csvRows.push("slug,features");
    log.info("CSV header added.");

    // Process the lessons
    if (lessons && lessons.length > 0) {
      log.info(`Processing ${lessons.length} lesson items.`);

      lessons.forEach((lesson) => {
        const hasRestrictedFeatures =
          lesson.features &&
          (lesson.features["agf__geo_restricted"] === true ||
            lesson.features["agf__login_required"] === true ||
            lesson.features["agf__restricted_download"] === true ||
            lesson.features["agf__has_copyright_restrictions"] === true);
        const slug = escapeCSVValue(String(lesson.slug || ""));
        const featuresJson = escapeCSVValue(
          JSON.stringify(lesson.features ?? {}),
        );
        const copyrightContent = escapeCSVValue(
          JSON.stringify(lesson.copyright_content || ""),
        );
        if (hasRestrictedFeatures) {
          csvRows.push(`${slug},${featuresJson},${copyrightContent}`);
          log.info(`Processed lesson: ${slug}`);
        }
      });
    } else {
      log.warn("No lessons found to export.");
    }

    // Only write to file if we have lessons (excluding header)
    if (lessons.length > 0) {
      const csvContent = csvRows.join("\n");

      // Write to file
      const filePath = path.join(process.cwd(), "lessons_export.csv");
      fs.writeFileSync(filePath, csvContent, "utf8");

      log.info(
        `Lessons CSV export completed with ${lessons.length} items: ${filePath}`,
      );
    } else {
      log.info("No lessons found. CSV file not created.");
    }
  } catch (error) {
    log.error("Error exporting lessons to CSV:", error);
  }
}
