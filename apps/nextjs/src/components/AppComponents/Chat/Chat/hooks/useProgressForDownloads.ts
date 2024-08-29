import { useMemo } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
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

export function useProgressForDownloads(lessonPlan: LooseLessonPlan) {
  return useMemo(() => {
    const parsedLessonPlan = lessonPlanSectionsSchema.safeParse(lessonPlan);
    const errors = parsedLessonPlan.error?.errors || [];
    const sections = [
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
  }, [lessonPlan]);
}
