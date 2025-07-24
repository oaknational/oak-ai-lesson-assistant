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

type TRPCWorksResponse = {
  data?: {
    tcpWorks?: {
      slug: string;
      lesson_id: number;
      works_list: {
        title: string;
        author?: string;
        works_id: number;
        works_uid: string;
        attribution?: string;
        restriction_level: string;
        tpc_contracts_list: number[];
        [key: string]: unknown;
      }[];
    }[];
  };
};

// Function to export TCP works data to CSV
export function exportTCPWorksToCSV(
  tcpData: TRPCWorksResponse,
  data: LessonOverviewResponse["data"],
): void {
  log.info("Starting TCP works CSV export...");
  console.log(JSON.stringify(tcpData, null, 2));
  try {
    const csvRows: string[] = [];
    let exportedRowCount = 0;

    // CSV header
    csvRows.push(
      "lesson_slug,lesson_id,work_title,author,works_id,works_uid,attribution,restriction_level,tpc_contracts_list",
    );
    log.info("TCP works CSV header added.");

    // Process the TCP works data
    const tcpWorks = tcpData.data?.tcpWorks ?? [];

    if (tcpWorks.length > 0) {
      log.info(`Processing ${tcpWorks.length} lesson slug items.`);

      tcpWorks.forEach((lessonData) => {
        const lessonSlug = escapeCSVValue(String(lessonData.slug ?? ""));
        const lessonId = escapeCSVValue(String(lessonData.lesson_id ?? ""));

        lessonData.works_list.forEach((work) => {
          const workTitle = escapeCSVValue(String(work.title ?? ""));
          const author = escapeCSVValue(String(work.author ?? ""));
          const worksId = escapeCSVValue(String(work.works_id ?? ""));
          const worksUid = escapeCSVValue(String(work.works_uid ?? ""));
          const attribution = escapeCSVValue(String(work.attribution ?? ""));
          const restrictionLevel = escapeCSVValue(
            String(work.restriction_level ?? ""),
          );
          const tpcContractsList = escapeCSVValue(
            JSON.stringify(work.tpc_contracts_list ?? []),
          );

          csvRows.push(
            `${lessonSlug},${lessonId},${workTitle},${author},${worksId},${worksUid},${attribution},${restrictionLevel},${tpcContractsList}`,
          );
          exportedRowCount++;
        });
      });
    } else {
      log.warn("No TCP works data found to export.");
    }

    // Only write to file if we have data rows (excluding header)
    if (exportedRowCount > 0) {
      const csvContent = csvRows.join("\n");

      // Write to file
      const filePath = path.join(process.cwd(), "tcp_works_export.csv");
      fs.writeFileSync(filePath, csvContent, "utf8");

      log.info(
        `TCP works CSV export completed with ${exportedRowCount} works items: ${filePath}`,
      );
    } else {
      log.info("No TCP works found. CSV file not created.");
    }
  } catch (error) {
    log.error("Error exporting TCP works to CSV:", error);
  }
}

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
          JSON.stringify(lesson.copyright_content ?? ""),
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

const RESTRICTED_CONTENT_GUIDANCE_TYPES = [
  "Depiction or discussion of discriminatory behaviour",
  "Depiction or discussion of sensitive content",
  "Depiction or discussion of sexual violence",
  "Depiction or discussion of sexual content",
  "Depiction or discussion of mental health issues",
  "Depiction or discussion of serious crime",
] as const;

// Function to export lessons with restricted content guidance to CSV
export function exportRestrictedContentGuidanceLessonsToCSV(
  lessons: LessonContentSchema[],
): void {
  log.info("Starting restricted content guidance lessons CSV export...");
  console.log(JSON.stringify(lessons, null, 2));
  try {
    const csvRows: string[] = [];

    // CSV header
    csvRows.push(
      "lesson_slug,lesson_title,lesson_id,content_guidance_labels,is_legacy",
    );
    log.info("CSV header added.");

    // Process the lessons
    if (lessons && lessons.length > 0) {
      log.info(`Processing ${lessons.length} lesson items.`);

      lessons.forEach((lesson) => {
        const lessonSlug = escapeCSVValue(String(lesson.lesson_slug ?? ""));
        const lessonTitle = escapeCSVValue(String(lesson.lesson_title ?? ""));
        const lessonId = escapeCSVValue(String(lesson.lesson_id ?? ""));
        const isLegacy = escapeCSVValue(String(lesson.is_legacy ?? false));

        // Extract content guidance labels
        const contentGuidanceLabels =
          lesson.content_guidance
            ?.map((guidance) => guidance.contentguidance_label)
            .filter((label) => label !== null && label !== undefined) ?? [];

        const hasRestrictedContent = contentGuidanceLabels.some((label) =>
          RESTRICTED_CONTENT_GUIDANCE_TYPES.includes(
            label as (typeof RESTRICTED_CONTENT_GUIDANCE_TYPES)[number],
          ),
        );

        const contentGuidanceLabelsJson = escapeCSVValue(
          JSON.stringify(contentGuidanceLabels),
        );

        if (hasRestrictedContent) {
          csvRows.push(
            `${lessonSlug},${lessonTitle},${lessonId},${contentGuidanceLabelsJson},${isLegacy}`,
          );
        }

        log.info(`Processed lesson: ${lessonSlug}`);
      });
    } else {
      log.warn("No lessons found to export.");
    }

    // Only write to file if we have lessons (excluding header)
    if (lessons.length > 0) {
      const csvContent = csvRows.join("\n");

      // Write to file
      const filePath = path.join(
        process.cwd(),
        "restricted_content_guidance_lessons_export.csv",
      );
      fs.writeFileSync(filePath, csvContent, "utf8");

      log.info(
        `Restricted content guidance lessons CSV export completed with ${lessons.length} items: ${filePath}`,
      );
    } else {
      log.info("No lessons found. CSV file not created.");
    }
  } catch (error) {
    log.error(
      "Error exporting restricted content guidance lessons to CSV:",
      error,
    );
  }
}
