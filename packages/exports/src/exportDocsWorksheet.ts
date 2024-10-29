import { aiLogger } from "@oakai/logger";

import { prepWorksheetForSlides } from "./dataHelpers/prepWorksheetForSlides";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import type { WorksheetSlidesInputData } from "./schema/input.schema";
import { getDocsTemplateIdWorksheet } from "./templates";
import type { OutputData, Result, State } from "./types";

const log = aiLogger("exports");

export const exportDocsWorksheet = async ({
  snapshotId,
  data: inputData,
  userEmail,
  onStateChange,
}: {
  snapshotId: string;
  data: WorksheetSlidesInputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
}): Promise<Result<OutputData>> => {
  try {
    const templateId = getDocsTemplateIdWorksheet();

    const result = await exportGeneric({
      newFileName: `${inputData.title} - ${snapshotId} - Worksheet docs`,
      data: inputData,
      prepData: prepWorksheetForSlides,
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
    log.error("Error", error);
    onStateChange({ status: "error", error });
    return { error, message: "Failed to export worksheet" };
  }
};
