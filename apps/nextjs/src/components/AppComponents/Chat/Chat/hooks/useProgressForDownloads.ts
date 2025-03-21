import { useMemo } from "react";

import type {
  LessonPlanKey,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { lessonPlanSectionsSchema } from "@oakai/exports/src/schema/input.schema";

import type { ZodIssue } from "zod";

import { useTranslation } from "@/components/ContextProviders/LanguageContext";

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

export function useProgressForDownloads({
  lessonPlan,
  isStreaming,
}: {
  lessonPlan: LooseLessonPlan;
  isStreaming: boolean;
}): ProgressForDownloads {
  const { t } = useTranslation();

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
        label: t("progressDropdown.lessonDetails"),
        key: "title",
        complete: getCompleteness(errors, ["title", "subject", "keyStage"]),
      },
      {
        label: t("progressDropdown.learningOutcome"),
        key: "learningOutcome",
        complete: getCompleteness(errors, ["learningOutcome"]),
      },
      {
        label: t("progressDropdown.learningCycleOutcomes"),
        key: "learningCycles",
        complete: getCompleteness(errors, ["learningCycles"]),
      },
      {
        label: t("progressDropdown.priorKnowledge"),
        key: "priorKnowledge",
        complete: getCompleteness(errors, ["priorKnowledge"]),
      },
      {
        label: t("progressDropdown.keyLearningPoints"),
        key: "keyLearningPoints",
        complete: getCompleteness(errors, ["keyLearningPoints"]),
      },
      {
        label: t("progressDropdown.misconceptions"),
        key: "misconceptions",
        complete: getCompleteness(errors, ["misconceptions"]),
      },
      {
        label: t("progressDropdown.keywords"),
        key: "keywords",
        complete: getCompleteness(errors, ["keywords"]),
      },
      {
        label: t("progressDropdown.starterQuiz"),
        key: "starterQuiz",
        complete: getCompleteness(errors, ["starterQuiz"]),
      },
      {
        label: t("progressDropdown.learningCycles"),
        key: "cycle1",
        complete: getCompleteness(errors, ["cycle1", "cycle2", "cycle3"]),
      },
      {
        label: t("progressDropdown.exitQuiz"),
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
  }, [lessonPlan, isStreaming, t]);
}
