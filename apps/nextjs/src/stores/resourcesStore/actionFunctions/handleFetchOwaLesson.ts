import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import type { TrpcUtils } from "@/utils/trpc";

import type {
  LoadOwaDataParams,
  ResourcesGetter,
  ResourcesSetter,
} from "../types";
import { callWithHandshakeRetry } from "../utils/callWithHandshakeRetry";
import { handleStoreError } from "../utils/errorHandling";

const log = aiLogger("additional-materials");

export const handleFetchOwaLesson =
  (
    set: ResourcesSetter,
    get: ResourcesGetter,
    trpc: TrpcUtils,
    refreshAuth?: () => Promise<void>,
  ) =>
  async (params: LoadOwaDataParams) => {
    try {
      // If we have an error from the page, handle it
      if (params.error) {
        log.error("Error loading OWA data to store", { error: params.error });
        handleStoreError(set, params.error, {
          context: "handleFetchOwaLesson",
        });
        return;
      }

      if (params.queryParams) {
        const { lessonSlug, programmeSlug, docType } = params.queryParams;

        // Set doc type using enum parse
        const parsedDoctype = additionalMaterialTypeEnum.parse(docType);
        set({ docType: parsedDoctype });

        log.info("Fetching OWA lesson data via tRPC", {
          lessonSlug,
          programmeSlug,
          docType,
        });

        // Set loading state
        set({ isResourcesLoading: true });
        const docTypeParsed = additionalMaterialTypeEnum.parse(docType);
        try {
          // Create a new session
          await get().actions.createMaterialSession(docTypeParsed, 3);

          log.info("Material session created ", {
            resourceId: get().id,
          });

          // Fetch the OWA lesson data

          const response = await callWithHandshakeRetry(
            () =>
              trpc.client.additionalMaterials.handleFetchOwaLesson.mutate({
                lessonSlug,
                programmeSlug,
              }),
            refreshAuth,
          );

          const { lesson } = response;

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
          log.info("Owa lesson set to store", {
            lessonId: lesson.lessonId,
            title: lesson.title,
            subject: lesson.subject,
            year: lesson.year,
            resourceId: get().id,
          });

          // Set lesson and transcript in page data
          set({
            pageData: {
              lessonPlan: lesson,
            },
          });

          log.info("OWA data fetched and loaded to store via tRPC");

          // Now that all data is loaded, trigger material generation
          const generateMaterial = get().actions.generateMaterial;
          await generateMaterial();
        } catch (fetchError) {
          log.error("Failed to fetch OWA lesson data via tRPC", { fetchError });

          handleStoreError(set, fetchError, {
            context: "handleFetchOwaLesson",
            documentType: docType,
          });
        } finally {
          set({ isResourcesLoading: false });
        }
      }
    } catch (error) {
      log.error("Error in handleFetchOwaLesson", { error });
      handleStoreError(set, error, {
        context: "handleFetchOwaLesson",
        documentType: params.queryParams?.docType,
      });
      set({ isResourcesLoading: false });
    }
  };
