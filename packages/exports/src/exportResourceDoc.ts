import { aiLogger } from "@oakai/logger";

import type { GlossaryTemplate } from "schema/resourceDoc.schema";

import { prepWorksheetForSlides } from "./dataHelpers/prepWorksheetForSlides";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import type { WorksheetSlidesInputData } from "./schema/input.schema";
import { getDocsTemplateIdWorksheet } from "./templates";
import type { OutputData, Result, State } from "./types";

const log = aiLogger("exports");

export const exportDocsWorksheet = async <
  TemplateData extends Record<string, string | string[] | null | undefined>,
  InputData extends Record<string, string | string[] | null | undefined>,
>({
  documentType,
  snapshotId,
  data: inputData,
  userEmail,
  onStateChange,
  prepDataHandler,
}: {
  snapshotId: string;
  documentType: "comp" | "glossary";
  data: InputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
  prepDataHandler: (data: InputData) => Promise<TemplateData>;
}): Promise<Result<OutputData>> => {
  try {
    const templateId = getDocsTemplateIdWorksheet();

    const transformDataMap: Record<
      string,
      (data: InputData) => Promise<TemplateData>
    > = {
      comp: async (data) => {
        // transform logic here
        return { ...data }; // just an example
      },
      glossary: async (data) => {
        // transform logic here
        return { ...data }; // another example
      },
    };
    const result = await exportGeneric<InputData, TemplateData>({
      newFileName: `${snapshotId} - ${documentType} `,
      data: inputData,
      prepData: transformDataMap,
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
