import { aiLogger } from "@oakai/logger";

import { extractDataFromBlocks } from "dataHelpers/extractDataFromBlocks";
import { blocksSchema } from "schema/resourceDoc.schema";
import { z } from "zod";

import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import type { OutputData, Result, State } from "./types";

const log = aiLogger("exports");

export const exportResourceDoc = async <TemplateData, InputData>({
  documentType,
  snapshotId,
  data: inputData,
  userEmail,
  onStateChange,
  transformData,
}: {
  snapshotId: string;
  documentType: "comp" | "glossary";
  data: InputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
  transformData: (data: InputData) => Promise<TemplateData>;
}): Promise<Result<OutputData>> => {
  try {
    const templateId = "1hJIGdIPImcqsRYuD13CNueYHvNKz_Vx9JDSVgcRVrLM";

    const result = await exportGeneric<InputData, TemplateData>({
      newFileName: `${snapshotId} - ${documentType} `,
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

export const glossarySchema = z.object({
  glossary: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    }),
  ),
});

export const transformDataGlossary =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = glossarySchema.parse(data);
    const { glossary } = parsedData;
    const transformedData = [
      { type: "title", text: "Lesson about...." },
      {
        type: "labelValue",
        items: glossary.map(({ term, definition }) => ({
          label: term,
          value: definition,
        })),
      },
    ];

    const parsedGlossaryTemplate = blocksSchema.parse(transformedData);

    return Promise.resolve(parsedGlossaryTemplate) as Promise<TemplateData>;
  };
