import { aiLogger } from "@oakai/logger";

import { prepLessonForAdditionalMaterialsDoc } from "./dataHelpers/prepLessonForSlides";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import { LessonSlidesInputData } from "./schema/input.schema";
import { getSlidesTemplateIdAdditionalMaterials as getDocsTemplateIdAdditionalMaterials } from "./templates";
import { OutputData, Result, State } from "./types";

const log = aiLogger("exports");

export const exportAdditionalMaterials = async ({
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
    const result = await exportGeneric({
      newFileName: `${lesson.title} - ${snapshotId} - Additional materials`,
      data: lesson,
      prepData: prepLessonForAdditionalMaterialsDoc,
      templateId: getDocsTemplateIdAdditionalMaterials(),
      updateTemplate: async ({ templateCopyId }) => {
        log.info("templateCopyId", templateCopyId);
      },
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        return populateDoc({
          googleDocs: client,
          documentId: templateCopyId,
          data: {
            lesson_title: data.lesson_title,
            content: removeMarkdown(data.content),
          },
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

function removeMarkdown(value: string): string {
  return value.replace(/[#*`]/g, "");
}

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
