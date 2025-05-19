import { aiLogger } from "@oakai/logger";

import { extractDataFromBlocks } from "./dataHelpers/extractDataFromBlocks";
import { exportGeneric } from "./exportGeneric";
import { dynamicPlaceholderTemplateIds } from "./gSuite/docs/cleanupUnusedPlaceholdersRequests";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import {
  getAdditionalResourcesTemplateId,
  getAllTemplateIdsForDocType,
} from "./templates";
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
    // For comprehension tasks, we need to create both the questions and answers files
    if (documentType === "additional-comprehension") {
      // Generate the regular document first (no answers)
      const templateId = getAdditionalResourcesTemplateId(documentType);

      // Create the main document
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
        folderId:
          process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID_ADDITIONAL_RESOURCES,
      });

      if ("error" in result) {
        onStateChange({ status: "error", error: result.error });
        return result;
      }

      // Create the answers document
      const answersTemplateId = getAdditionalResourcesTemplateId(
        documentType,
        true,
      );

      const answersResult = await exportGeneric<InputData, TemplateData>({
        newFileName: `${id ? id + "- " : ""} ${lessonTitle} - ${documentType} Answers - ${Date.now()}`,
        data: inputData,
        prepData: transformData,
        templateId: answersTemplateId,
        populateTemplate: async ({ data, templateCopyId }) => {
          const client = await getDocsClient();
          const dataFromBlocks = extractDataFromBlocks(data);
          return populateDoc({
            googleDocs: client,
            documentId: templateCopyId,
            data: dataFromBlocks,
            enablePlaceholderCleanup:
              dynamicPlaceholderTemplateIds.includes(answersTemplateId),
          });
        },
        userEmail,
        onStateChange: (state) => {
          // Don't update the main state for answers document
          log.info("Answers document state change", state);
        },
        folderId:
          process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID_ADDITIONAL_RESOURCES,
      });

      if ("error" in answersResult) {
        log.error("Error generating answers document", answersResult.error);
        // Continue with success state for the main document
      } else {
        // Combine file IDs from both documents for download
        result.data.fileIds = [result.data.fileId, answersResult.data.fileId];
      }

      const { data } = result;

      onStateChange({ status: "success", data });
      return { data };
    } else {
      // Regular document processing for other document types
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
        folderId:
          process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID_ADDITIONAL_RESOURCES,
      });

      if ("error" in result) {
        onStateChange({ status: "error", error: result.error });
        return result;
      }

      const { data } = result;

      onStateChange({ status: "success", data });
      return { data };
    }
  } catch (error) {
    log.error("Error", error);
    onStateChange({ status: "error", error });
    return { error, message: "Failed to export resource" };
  }
};
