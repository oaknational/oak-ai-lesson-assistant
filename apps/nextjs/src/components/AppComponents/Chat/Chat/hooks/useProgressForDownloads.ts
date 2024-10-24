import { useMemo } from "react";

import {
  LessonPlanKeys,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { lessonPlanSectionsSchema } from "@oakai/exports/src/schema/input.schema";
import { ZodIssue } from "zod";

/**
 * For a given list of Zod issues and lessonPlan fields, checks that none of
 * the errors pertain to the fields.
 */
function getCompleteness(errors: ZodIssue[], fields: string[]) {
  const hasErrorInSomeField = errors.reduce(
    (acc, curr) => acc || fields.some((field) => curr.path[0] === field),
    false,
  );

  return !hasErrorInSomeField;
}
export type ProgressSections = ProgressSection[];

type ProgressForDownloads = {
  sections: ProgressSection[];
  totalSections: number;
  totalSectionsComplete: number;
};

type ProgressSection = {
  label: string;
  key: LessonPlanKeys;
  complete: boolean;
};

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
      }) || [];

    const sections: ProgressSection[] = [
      {
        label: "Lesson details",
        key: "title",
        complete: getCompleteness(errors, ["title", "subject", "keyStage"]),
      },
      {
        label: "Learning outcome",
        key: "learningOutcome",
        complete: getCompleteness(errors, ["learningOutcome"]),
      },
      {
        label: "Learning cycle outcomes",
        key: "learningCycles",
        complete: getCompleteness(errors, ["learningCycles"]),
      },
      {
        label: "Prior knowledge",
        key: "priorKnowledge",
        complete: getCompleteness(errors, ["priorKnowledge"]),
      },
      {
        label: "Key learning points",
        key: "keyLearningPoints",
        complete: getCompleteness(errors, ["keyLearningPoints"]),
      },
      {
        label: "Misconceptions",
        key: "misconceptions",
        complete: getCompleteness(errors, ["misconceptions"]),
      },
      {
        label: "Keywords",
        key: "keywords",
        complete: getCompleteness(errors, ["keywords"]),
      },
      {
        label: "Starter quiz",
        key: "starterQuiz",
        complete: getCompleteness(errors, ["starterQuiz"]),
      },
      {
        label: "Learning cycles",
        key: "cycle1",
        complete: getCompleteness(errors, ["cycle1", "cycle2", "cycle3"]),
      },
      {
        label: "Exit quiz",
        key: "exitQuiz",
        complete: getCompleteness(errors, ["exitQuiz"]),
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
