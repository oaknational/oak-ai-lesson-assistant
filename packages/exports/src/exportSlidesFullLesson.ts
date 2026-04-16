import { prepLessonForSlides } from "./dataHelpers/prepLessonForSlides";
import { exportGeneric } from "./exportGeneric";
import { clearSpeakerNoteTags } from "./gSuite/slides/clearSpeakerNoteTags";
import { googleSlides } from "./gSuite/slides/client";
import {
  type SpeakerNotesTag,
  deleteSlides,
} from "./gSuite/slides/deleteSlides";
import { populateSlides } from "./gSuite/slides/populateSlides";
import type { LessonSlidesInputData } from "./schema/input.schema";
import { getSlidesTemplateIdFullLesson } from "./templates";
import type { OutputData, Result, State } from "./types";

export const exportSlidesFullLesson = async ({
  snapshotId,
  lesson,
  userEmail,
  onStateChange,
}: {
  snapshotId: string;
  lesson: LessonSlidesInputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
}): Promise<Result<OutputData>> => {
  try {
    const speakerNotesTagsToDelete: SpeakerNotesTag[] =
      lesson.subject === "maths" ? ["starterQuiz", "exitQuiz"] : [];

    const result = await exportGeneric({
      newFileName: `${lesson.title} - ${snapshotId} - Lesson slides`,
      data: lesson,
      prepData: prepLessonForSlides,
      templateId: getSlidesTemplateIdFullLesson(),
      updateTemplate: async ({ templateCopyId }) => {
        await deleteSlides({
          googleSlides,
          presentationId: templateCopyId,
          speakerNotesTagsToDelete,
        });
      },
      populateTemplate: async ({ data, templateCopyId }) => {
        const populateResult = await populateSlides({
          googleSlides,
          presentationId: templateCopyId,
          data,
          valueToString,
        });

        const didPopulate = "data" in populateResult;
        if (didPopulate) {
          await clearSpeakerNoteTags({
            googleSlides,
            presentationId: templateCopyId,
          });
        }

        return populateResult;
      },
      userEmail,
      onStateChange,
    });
    if ("error" in result) {
      onStateChange({ status: "error", error: result.error });
      return result;
    }

    const { data } = result;

    onStateChange({ status: "success", data });
    return { data };
  } catch (error) {
    onStateChange({ status: "error", error });
    return { error, message: "An unknown error occurred" };
  }
};

function valueToString(
  key: string,
  value: string | string[] | null | undefined,
) {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    switch (key) {
      case "learning_outcomes":
        return value.map((s) => `${s}`).join("\n");
      case "keywords":
        return value.map((s) => `${s}`).join("\n\n");
      case "keyword_sentences":
        return value.map((s) => `${s}`).join("\n");
      default:
        return value.join("\n");
    }
  } else {
    return value;
  }
}
