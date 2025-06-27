import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { lessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";

import { string, z } from "zod";

import type { TeachingMaterialsPageProps } from "@/app/aila/tools/teaching-materials/teachingMaterialsView";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const dataFromOwaSchema = z.object({
  lesson: lessonPlanSchemaTeachingMaterials,
  transcript: string().optional(),
  initialStep: z.number(),
  docTypeFromQueryPrams: additionalMaterialTypeEnum,
  id: z.string(),
  lessonId: z.string(),
});

export type LoadOwaDataParams = Pick<
  TeachingMaterialsPageProps,
  | "lesson"
  | "transcript"
  | "initialStep"
  | "docTypeFromQueryPrams"
  | "id"
  | "lessonId"
>;

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

      const parsedFormProps = z
        .object({
          subject: z.string(),
          title: z.string(),
          year: z.string(),
        })
        .parse({
          subject: lesson.subject,
          title: lesson.title,
          year: `Year ${lesson.year}`,
        });

      // Load form state data (year/subject/lesson title)
      set((state) => ({
        formState: {
          ...state.formState,
          ...parsedFormProps,
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
