import { useMemo } from "react";

import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { lessonPlanSectionsSchema } from "@oakai/exports/src/schema/input.schema";

import type { ZodIssue } from "zod";

export type ProgressForDownloads = {
  sections: ProgressSection[];
  totalSections: number;
  totalSectionsComplete: number;
};

export type ProgressSection = {
  label: string;
  key: LessonPlanKey;
  complete: boolean;
};

export type ProgressSections = ProgressSection[];

/**
 * Check if cycles section is complete - requires at least one cycle
 */
function getCycleCompleteness(errors: ZodIssue[], lessonPlan: LooseLessonPlan) {
  const cycleFields = ["cycle1", "cycle2", "cycle3"];
  const hasErrorInCycles = errors.some(error => 
    cycleFields.some(field => error.path[0] === field)
  );
  
  // At least one cycle should exist and have meaningful content
  const hasAtLeastOneCycle = cycleFields.some(field => {
    const value = lessonPlan[field as LessonPlanKey];
    return value !== null && value !== undefined && 
           (typeof value !== 'string' || (value !== '' && value !== 'None'));
  });
  
  return !hasErrorInCycles && hasAtLeastOneCycle;
}

/**
 * For a given list of Zod issues and lessonPlan fields, checks that none of
 * the errors pertain to the fields and that all fields have meaningful values.
 */
function getCompleteness(errors: ZodIssue[], fields: string[], lessonPlan: LooseLessonPlan, isOptional: boolean = false) {
  const hasErrorInSomeField = errors.reduce(
    (acc, curr) => acc || fields.some((field) => curr.path[0] === field),
    false,
  );

  // For optional fields, if they don't exist, consider them complete
  // For required fields, they must exist and have meaningful values
  const allFieldsHaveValues = fields.every((field) => {
    const value = lessonPlan[field as LessonPlanKey];
    
    // For optional fields, missing/null/undefined values are considered complete
    if (isOptional && (value === null || value === undefined)) return true;
    
    // Handle different types of "empty" values
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && (value === '' || value === 'None')) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  return !hasErrorInSomeField && allFieldsHaveValues;
}

export function useProgressForDownloads({
  lessonPlan,
  isStreaming,
}: {
  lessonPlan: LooseLessonPlan;
  isStreaming: boolean;
}): ProgressForDownloads {
  return useMemo(() => {
    const parsedLessonPlan = lessonPlanSectionsSchema.safeParse(lessonPlan);
    const errors =
      parsedLessonPlan.error?.errors.filter((error) => {
        if (isStreaming) {
          /**
           * When we have partial data, we get errors about nested
           * properties. We want to filter these out during streaming to avoid a
           * flickering progress bar.
           */
          return error.path.length === 1;
        }
        if (!isStreaming) {
          /**
           * When not streaming, we want to check that each section is successfully
           * parsed, so we keep all errors.
           *
           * This means we know it's in the correct structure for exports.
           *
           * Most of the time, this will be the same as the above condition because
           * we don't expect to have errors in the data structure when Aila is not
           * streaming.
           */
          return true;
        }
      }) ?? [];

    const sections: ProgressSection[] = [
      {
        label: "Lesson details",
        key: "title",
        complete: getCompleteness(errors, ["title", "subject", "keyStage"], lessonPlan),
      },
      {
        label: "Topic",
        key: "topic",
        complete: getCompleteness(errors, ["topic"], lessonPlan, true),
      },
      {
        label: "Learning outcome",
        key: "learningOutcome",
        complete: getCompleteness(errors, ["learningOutcome"], lessonPlan),
      },
      {
        label: "Learning cycle outcomes",
        key: "learningCycles",
        complete: getCompleteness(errors, ["learningCycles"], lessonPlan),
      },
      {
        label: "Prior knowledge",
        key: "priorKnowledge",
        complete: getCompleteness(errors, ["priorKnowledge"], lessonPlan),
      },
      {
        label: "Key learning points",
        key: "keyLearningPoints",
        complete: getCompleteness(errors, ["keyLearningPoints"], lessonPlan),
      },
      {
        label: "Misconceptions",
        key: "misconceptions",
        complete: getCompleteness(errors, ["misconceptions"], lessonPlan),
      },
      {
        label: "Keywords",
        key: "keywords",
        complete: getCompleteness(errors, ["keywords"], lessonPlan),
      },
      {
        label: "Starter quiz",
        key: "starterQuiz",
        complete: getCompleteness(errors, ["starterQuiz"], lessonPlan),
      },
      {
        label: "Learning cycles",
        key: "cycle1",
        complete: getCycleCompleteness(errors, lessonPlan),
      },
      {
        label: "Exit quiz",
        key: "exitQuiz",
        complete: getCompleteness(errors, ["exitQuiz"], lessonPlan),
      },
      {
        label: "Additional materials",
        key: "additionalMaterials",
        complete: getCompleteness(errors, ["additionalMaterials"], lessonPlan, true),
      },
    ];

    const totalSections = sections.length;
    const totalSectionsComplete = sections.filter(
      (section) => section.complete,
    ).length;

    return {
      sections,
      totalSections,
      totalSectionsComplete,
    };
  }, [lessonPlan, isStreaming]);
}
