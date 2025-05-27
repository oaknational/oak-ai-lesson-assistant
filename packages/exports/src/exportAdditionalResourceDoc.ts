import { aiLogger } from "@oakai/logger";

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

// Simple function to extract data from blocks - replaces the complex extractDataFromBlocks
const extractDataFromBlocks = <T>(
  blocks: T,
): Record<string, string | string[] | null | undefined> => {
  const map: Record<string, string | string[] | null | undefined> = {};

  // Parse blocks to ensure they match the expected schema
  const parsedBlocks = Array.isArray(blocks) ? blocks : [];

  for (const block of parsedBlocks) {
    if (typeof block === "object" && block !== null && "type" in block) {
      const typedBlock = block as { type: string; [key: string]: unknown };

      switch (typedBlock.type) {
        case "title":
          if ("text" in typedBlock && typeof typedBlock.text === "string") {
            map[typedBlock.type] = typedBlock.text;
          }
          break;
        case "labelValue":
          // Handle glossary terms - create individual key-value pairs
          if ("items" in typedBlock && Array.isArray(typedBlock.items)) {
            for (const item of typedBlock.items) {
              if (
                typeof item === "object" &&
                item !== null &&
                "label" in item &&
                "value" in item &&
                typeof (item as { label: unknown }).label === "string" &&
                typeof (item as { value: unknown }).value === "string"
              ) {
                const typedItem = item as { label: string; value: string };
                map[typedItem.label] = typedItem.value;
              }
            }
          }
          break;
        case "placeholders":
          // Direct placeholder mapping - just merge the map
          if (
            "map" in typedBlock &&
            typeof typedBlock.map === "object" &&
            typedBlock.map !== null
          ) {
            Object.assign(map, typedBlock.map);
          }
          break;
      }
    }
  }

  return map;
};

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
      // @todo we should think about having a mechnism here in the the future that is more flexible and not specific to the document type
      const templateId = getAdditionalResourcesTemplateId({
        docType: documentType,
      });

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

      const answersTemplateId = getAdditionalResourcesTemplateId({
        docType: documentType,
        withAnswers: true,
      });

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
      const templateId = getAdditionalResourcesTemplateId({
        docType: documentType,
      });

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
