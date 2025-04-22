import { blocksSchema } from "@oakai/exports/src/schema/additionalResourceBlockSchema.schema";

import { comprehensionTaskSchema } from "../comprehension/schema";
import type { AdditionalMaterialType } from "../configSchema";
import { glossarySchema } from "../glossary/schema";

export const transformDataForExport = (
  documentType: AdditionalMaterialType,
) => {
  switch (documentType) {
    case "additional-glossary":
      return transformDataGlossary;
    case "additional-comprehension":
      return transformDataComprehension;
    default:
      throw new Error(`Unknown document type`);
  }
};

export const transformDataGlossary =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = glossarySchema.parse(data);
    const { glossary, lessonTitle } = parsedData;
    const transformedData = [
      { type: "title", text: lessonTitle },
      {
        type: "labelValue",
        items: glossary.map(({ term, definition }) => ({
          label: `${term}:`,
          value: definition,
        })),
      },
    ];

    const parsedGlossaryTemplate = blocksSchema.parse(transformedData);

    return Promise.resolve(parsedGlossaryTemplate) as Promise<TemplateData>;
  };

export const transformDataComprehension =
  <InputData, TemplateData>() =>
  (data: InputData): Promise<TemplateData> => {
    const parsedData = comprehensionTaskSchema.parse(data);
    const { comprehension } = parsedData;
    const transformedData = [{ type: "title", text: comprehension.title }];

    const parsedGlossaryTemplate = blocksSchema.parse(transformedData);

    return Promise.resolve(parsedGlossaryTemplate) as Promise<TemplateData>;
  };
