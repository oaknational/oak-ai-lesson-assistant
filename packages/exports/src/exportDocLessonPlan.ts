import { prepLessonPlanForDocs } from "./dataHelpers/prepLessonPlanForDocs";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import { LessonPlanDocInputData } from "./schema/input.schema";
import { getDocsTemplateIdLessonPlan } from "./templates";
import { OutputData, Result, State } from "./types";

export const exportDocLessonPlan = async ({
  snapshotId,
  lessonPlan,
  userEmail,
  onStateChange,
}: {
  snapshotId: string;
  lessonPlan: LessonPlanDocInputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
}): Promise<Result<OutputData>> => {
  try {
    onStateChange({ status: "loading", message: "Starting..." });
    const templateId = getDocsTemplateIdLessonPlan(lessonPlan);
    if (!templateId) {
      throw new Error("Template ID not found");
    }

    const { title } = lessonPlan;

    const result = await exportGeneric({
      newFileName: `${title} - ${snapshotId} - Lesson plan`,
      data: lessonPlan,
      prepData: prepLessonPlanForDocs,
      templateId,
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        return populateDoc({
          googleDocs: client,
          documentId: templateCopyId,
          data,
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
