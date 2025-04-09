import { aiLogger } from "@oakai/logger";

import {
  type GlossaryTemplate,
  glossaryTemplate,
} from "schema/resourceDoc.schema";

import { prepWorksheetForSlides } from "./dataHelpers/prepWorksheetForSlides";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import type { WorksheetSlidesInputData } from "./schema/input.schema";
import { getDocsTemplateIdWorksheet } from "./templates";
import type { OutputData, Result, State } from "./types";

const log = aiLogger("exports");

export const exportResourceDoc = async <
  TemplateData extends Record<string, string | string[] | null | undefined>,
  InputData extends Record<string, string | string[] | null | undefined>,
>({
  documentType,
  snapshotId,
  data: inputData,
  userEmail,
  onStateChange,
  prepDataHandler,
  transformDataMap
}: {
  snapshotId: string;
  documentType: "comp" | "glossary";
  data: InputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
  prepDataHandler: (data: InputData) => Promise<TemplateData>;
  transformDataMap: 
}): Promise<Result<OutputData>> => {
  try {
    const templateId = getDocsTemplateIdWorksheet();

    // const transformDataMap = {
    //   glossary: async (data: InputData): Promise<TemplateData> => {
    //     const parsedData = glossaryTemplate.parse(data);
    //     const { title, labelValueArray } = parsedData;
    //     const transformedData = {
    //       title,
    //       labelValueArray: labelValueArray.map(({ label, value }) => ({
    //         label,
    //         value,
    //       })),
    //     };
    //     // transform logic here
    //     return transformedData as unknown as TemplateData;
    //   },
    //   comp: async (data: InputData): Promise<TemplateData> => {
    //     // transform logic here
    //     return { ...data };
    //   },
    // };
    const result = await exportGeneric<InputData, TemplateData>({
      newFileName: `${snapshotId} - ${documentType} `,
      data: inputData,
      prepData: transformDataMap[documentType],
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

const transformDataMap = {
  glossary: async (data: InputData): Promise<TemplateData> => {
    const parsedData = glossaryTemplate.parse(data);
    const { title, labelValueArray } = parsedData;
    const transformedData = {
      title,
      labelValueArray: labelValueArray.map(({ label, value }) => ({
        label,
        value,
      })),
    };
    // transform logic here
    return transformedData as unknown as TemplateData;
  },
  comp: async (data: InputData): Promise<TemplateData> => {
    // transform logic here
    return { ...data };
  },
};

const doc = exportResourceDoc(
  {documentType: "glossary",
  
    snapshotId: "123",
    data: {},
    userEmail: "email",
    onStateChange: () => console.log("change"),
    prepDataHandler: () => console.log("handler"),
    transformDataMap
  }
)
