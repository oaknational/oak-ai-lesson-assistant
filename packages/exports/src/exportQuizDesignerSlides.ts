import { prepQuizDesignerForSlides } from "./dataHelpers/prepLessonForSlides";
import { exportGeneric } from "./exportGeneric";
import { googleSlides } from "./gSuite/slides/client";
import {
  deleteSlides,
  type SpeakerNotesTag,
} from "./gSuite/slides/deleteSlides";
import { populateSlides } from "./gSuite/slides/populateSlides";
import type { ExportableQuizAppState } from "./schema/input.schema";
import { getQuizDesignerSlidesTemplateIdWorksheet } from "./templates";
import type { OutputData, Result, State } from "./types";

export const exportQuizDesignerSlides = async ({
  snapshotId,
  quiz,
  userEmail,
  onStateChange,
}: {
  snapshotId: string;
  quiz: ExportableQuizAppState;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
}): Promise<Result<OutputData>> => {
  try {
    const speakerNotesTagsToDelete: SpeakerNotesTag[] = Array.from(
      { length: 20 - quiz.questions.length },
      (_, i) => i + quiz.questions.length + 1,
    ).map((n) => `question${n}` as SpeakerNotesTag);

    const result = await exportGeneric({
      newFileName: `${quiz.topic + " " + quiz.subject + " " + quiz.keyStage} - ${snapshotId} - Quiz slides`,
      data: quiz,
      prepData: prepQuizDesignerForSlides,
      templateId: getQuizDesignerSlidesTemplateIdWorksheet(),
      updateTemplate: async ({ templateCopyId }) => {
        await deleteSlides({
          googleSlides,
          presentationId: templateCopyId,
          speakerNotesTagsToDelete,
        });
      },
      populateTemplate: async ({ data, templateCopyId }) => {
        return populateSlides({
          googleSlides,
          presentationId: templateCopyId,
          data,
          valueToString,
        });
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
