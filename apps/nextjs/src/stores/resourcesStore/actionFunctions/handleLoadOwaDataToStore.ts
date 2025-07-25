import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { lessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";
import { aiLogger } from "@oakai/logger";

import { string, z } from "zod";

import type { TeachingMaterialsPageProps } from "@/app/aila/teaching-materials/teachingMaterialsView";
import type { TrpcUtils } from "@/utils/trpc";

import type { ResourcesGetter, ResourcesSetter } from "../types";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("additional-materials");

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
  | "error"
  | "queryParams"
>;

export const handleLoadOwaDataToStore =
  (set: ResourcesSetter, get: ResourcesGetter, trpc: TrpcUtils) =>
  async (params: LoadOwaDataParams) => {
    try {
      console.log("Loading OWA data to store", params);

      // If we have an error from the page, handle it
      if (params.error) {
        log.error("Error loading OWA data to store", { error: params.error });
        handleStoreError(set, params.error, {
          context: "handleLoadOwaDataToStore",
        });
        return;
      }

      // If we already have lesson data (legacy path), handle it
      // if (params.lesson) {
      //   const parsedParams = dataFromOwaSchema.parse(params);
      //   const {
      //     lesson,
      //     transcript,
      //     initialStep,
      //     docTypeFromQueryPrams,
      //     id,
      //     lessonId,
      //   } = parsedParams;

      //   const parsedFormProps = z
      //     .object({
      //       subject: z.string(),
      //       title: z.string(),
      //       year: z.string(),
      //     })
      //     .parse({
      //       subject: lesson.subject,
      //       title: lesson.title,
      //       year: `Year ${lesson.year}`,
      //     });

      //   // Load form state data (year/subject/lesson title)
      //   set((state) => ({
      //     formState: {
      //       ...state.formState,
      //       ...parsedFormProps,
      //     },
      //   }));

      //   // Set step number
      //   set({ stepNumber: initialStep });

      //   // Set doc type using enum parse
      //   const parsedDoctype = additionalMaterialTypeEnum.parse(
      //     docTypeFromQueryPrams,
      //   );
      //   set({ docType: parsedDoctype });

      //   // Set lesson and transcript in page data
      //   set({
      //     pageData: {
      //       lessonPlan: {
      //         ...lesson,
      //         lessonId,
      //       },
      //       transcript: transcript ?? null,
      //     },
      //   });

      //   // Set the id in the store
      //   set({ id });
      //   log.info("Owa data loaded to store");
      //   return;
      // }

      // New path: fetch data using tRPC
      if (params.queryParams) {
        const { lessonSlug, programmeSlug, docType } = params.queryParams;

        log.info("Fetching OWA lesson data via tRPC", {
          lessonSlug,
          programmeSlug,
          docType,
        });

        // Set loading state
        set({ isResourcesLoading: true });

        try {
          const response =
            await trpc.client.additionalMaterials.fetchOwaLesson.mutate({
              lessonSlug,
              programmeSlug,
            });

          const { lesson, transcript } = response;

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

          // Set step number to 3 (material generation step)
          set({ stepNumber: 3 });

          // Set doc type using enum parse
          const parsedDoctype = additionalMaterialTypeEnum.parse(docType);
          set({ docType: parsedDoctype });

          // Set lesson and transcript in page data
          set({
            pageData: {
              lessonPlan: lesson,
              transcript: transcript ?? null,
            },
          });

          // Set the id in the store
          set({ id: params.id });

          log.info("OWA data fetched and loaded to store via tRPC");

          // Now that all data is loaded, trigger material generation
          const generateMaterial = get().actions.generateMaterial;
          await generateMaterial();
        } catch (fetchError) {
          log.error("Failed to fetch OWA lesson data via tRPC", { fetchError });

          // Handle specific tRPC errors
          if (
            fetchError &&
            typeof fetchError === "object" &&
            "message" in fetchError
          ) {
            const message = fetchError.message as string;
            if (message.includes("copyright")) {
              handleStoreError(
                set,
                {
                  type: "copyright",
                  message:
                    "This lesson contains copyright-restricted resources and cannot be exported.",
                },
                {
                  context: "handleLoadOwaDataToStore",
                  documentType: docType,
                },
              );
              return;
            } else if (message.includes("content-guidance")) {
              handleStoreError(
                set,
                {
                  type: "restrictedContentGuidance",
                  message:
                    "This lesson contains restricted content-guidance themes and cannot be exported.",
                },
                {
                  context: "handleLoadOwaDataToStore",
                  documentType: docType,
                },
              );
              return;
            }
          }

          handleStoreError(set, fetchError, {
            context: "handleLoadOwaDataToStore",
            documentType: docType,
          });
        } finally {
          set({ isResourcesLoading: false });
        }
      }
    } catch (error) {
      log.error("Error in handleLoadOwaDataToStore", { error });
      handleStoreError(set, error, {
        context: "handleLoadOwaDataToStore",
        documentType: params.docTypeFromQueryPrams,
      });
      set({ isResourcesLoading: false });
    }
  };
