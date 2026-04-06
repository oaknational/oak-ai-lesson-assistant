import type { ContentGuidanceCategory } from "./dataHelpers/prepLessonPlanForDocs";
import { prepLessonPlanForDocs } from "./dataHelpers/prepLessonPlanForDocs";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populate/populateDoc";
import { LATEX_VISUAL_SCALE_LESSON_PLAN } from "./images/constants";
import type { LessonPlanDocInputData } from "./schema/input.schema";
import {
  getDocsTemplateIdLessonPlan,
  getDocsTemplateIdLessonPlanWithContentGuidance,
} from "./templates";
import type { OutputData, Result, State } from "./types";

export const exportDocLessonPlan = async ({
  snapshotId,
  lessonPlan,
  userEmail,
  onStateChange,
  contentGuidanceCategories,
}: {
  snapshotId: string;
  lessonPlan: LessonPlanDocInputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
  contentGuidanceCategories?: ContentGuidanceCategory[];
}): Promise<Result<OutputData>> => {
  try {
    onStateChange({ status: "loading", message: "Starting..." });
    const isFlagged =
      contentGuidanceCategories && contentGuidanceCategories.length > 0;
    const templateId = isFlagged
      ? getDocsTemplateIdLessonPlanWithContentGuidance()
      : getDocsTemplateIdLessonPlan();
    if (!templateId) {
      throw new Error("Template ID not found");
    }

    const { title, cycle2, cycle3 } = lessonPlan;

    const tablePlaceholdersToRemove = [
      ...(cycle2 ? [] : ["{{learning_cycle_2_title}}"]),
      ...(cycle3 ? [] : ["{{learning_cycle_3_title}}"]),
    ];

    const result = await exportGeneric({
      newFileName: `${title} - ${snapshotId} - Lesson plan`,
      data: lessonPlan,
      prepData: (data) => prepLessonPlanForDocs(data, contentGuidanceCategories),
      templateId,
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        return populateDoc({
          googleDocs: client,
          documentId: templateCopyId,
          data,
          tablePlaceholdersToRemove,
          enablePlaceholderCleanup: !!isFlagged,
          latexVisualScale: LATEX_VISUAL_SCALE_LESSON_PLAN,
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
    return { error, message: "Failed to export lesson plan" };
  }
};
