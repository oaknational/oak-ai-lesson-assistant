import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { LessonPlanSchemaWhilstStreaming } from "@oakai/aila/src/protocol/schema";

import { string, z } from "zod";

import type { AdditionalMaterialsPageProps } from "@/app/aila/resources/resources-contents";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const dataFromOwaSchema = z.object({
  lesson: LessonPlanSchemaWhilstStreaming,
  transcript: string().optional(),
  initialStep: z.number(),
  docTypeFromQueryPrams: additionalMaterialTypeEnum,
  id: z.string(),
  lessonId: z.string(),
});

export type LoadOwaDataParams = {
  lesson?: AdditionalMaterialsPageProps["lesson"];
  transcript?: AdditionalMaterialsPageProps["transcript"];
  initialStep?: AdditionalMaterialsPageProps["initialStep"];
  docTypeFromQueryPrams?: AdditionalMaterialsPageProps["docTypeFromQueryPrams"];
  id?: AdditionalMaterialsPageProps["id"];
  lessonId?: string;
};

export const handleLoadOwaDataToStore =
  (set: ResourcesSetter, _get: ResourcesGetter) =>
  (params: LoadOwaDataParams) => {
    try {
      const parsedParams = dataFromOwaSchema.parse(params);

      const {
        lesson,
        transcript,
        initialStep,
        docTypeFromQueryPrams,
        id,
        lessonId,
      } = parsedParams;

      // Load form state data (year/subject/lesson title)
      set((state) => ({
        formState: {
          ...state.formState,
          ...parsedParams, // @todo we should have year in here
        },
      }));

      // Set step number
      set({ stepNumber: initialStep });

      // Set doc type using enum parse
      const parsedDoctype = additionalMaterialTypeEnum.parse(
        docTypeFromQueryPrams,
      );
      set({ docType: parsedDoctype });

      // Set lesson and transcript in page data
      set({
        pageData: {
          lessonPlan: {
            ...lesson,
            lessonId,
          },
          transcript: transcript ?? null,
        },
      });

      // Set the id in the store
      set({ id });
    } catch (error) {
      handleStoreError(set, error, {
        context: "handleGenerateMaterial",
        documentType: params.docTypeFromQueryPrams,
      });
    }
  };
