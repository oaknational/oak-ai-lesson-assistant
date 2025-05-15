import { aiLogger } from "@oakai/logger";

import { extractDataFromBlocks } from "./dataHelpers/extractDataFromBlocks";
import { exportGeneric } from "./exportGeneric";
import { dynamicPlaceholderTemplateIds } from "./gSuite/docs/cleanupUnusedPlaceholdersRequests";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import { getAdditionalResourcesTemplateId } from "./templates";
import type { OutputData, Result, State } from "./types";

const log = aiLogger("exports");

export const exportAdditionalResourceDoc = async <InputData, TemplateData>({
  documentType,
  lessonTitle,
  id,
  data: inputData,
  userEmail,
  onStateChange,
  transformData,
}: {
  id?: string;
  documentType: string;
  lessonTitle: string;
  data: InputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
  transformData: (data: InputData) => Promise<TemplateData>;
}): Promise<Result<OutputData>> => {
  try {
    const templateId = getAdditionalResourcesTemplateId(documentType);

    const result = await exportGeneric<InputData, TemplateData>({
      newFileName: `${id ? id + "- " : ""} ${lessonTitle} - ${documentType} - ${Date.now()}`,
      data: inputData,
      prepData: transformData,
      templateId,
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        const dataFromBlocks = extractDataFromBlocks(data);
        return populateDoc({
          googleDocs: client,
          documentId: templateCopyId,
          data: dataFromBlocks,
          enablePlaceholderCleanup:
            dynamicPlaceholderTemplateIds.includes(templateId),
        });
      },
      userEmail,
      onStateChange,
      folderId: process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID_ADDITIONAL_RESOURCES,
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
    return { error, message: "Failed to export resource" };
  }
};
