import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import { useResourcesActions } from "@/stores/ResourcesStoreProvider";
import { trpc } from "@/utils/trpc";

const log = aiLogger("additional-materials");
const useStepSubmitLogic = () => {
  const {
    submitLessonPlan,
    setStepNumber,
    generateMaterial,
    createMaterialSession,
  } = useResourcesActions();

  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();
  const updateMaterialSession =
    trpc.additionalMaterials.updateMaterialSession.useMutation();
  const createSession =
    trpc.additionalMaterials.createMaterialSession?.useMutation?.();

  // Handle submit for step 2
  const handleSubmitLessonPlan = async (params: {
    title: string;
    subject: string;
    keyStage: string;
    year: string;
  }) => {
    setStepNumber(2);
    try {
      await submitLessonPlan({
        ...params,
        mutateAsync: async (input) => {
          try {
            const result = await generateLessonPlan.mutateAsync(input);
            if (!result) {
              throw new Error("Mutation returned null");
            }
            return result;
          } catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
          }
        },
        updateSessionMutateAsync: async (input) => {
          try {
            return await updateMaterialSession.mutateAsync(input);
          } catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
          }
        },
      });
    } catch (error) {
      log.error("Failed to generate lesson plan:", error);
      Sentry.captureException(error);
    }
  };

  // Handle submit for step 3
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = () => {
    setStepNumber(3);

    void generateMaterial({
      mutateAsync: async (input) => {
        log.info("Submitting material generation with input:", input);
        try {
          return await fetchMaterial.mutateAsync(input);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          Sentry.captureException(error);
          throw error;
        }
      },
    });
  };
  // Handle submit for step 1
  const handleCreateSession = ({ documentType }: { documentType: string }) => {
    setStepNumber(1);
    void createMaterialSession({
      documentType,
      mutateAsync: async (documentType) => {
        log.info("Creating session with:", documentType);
        try {
          return await createSession.mutateAsync(documentType);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          Sentry.captureException(error);
          throw error;
        }
      },
    });
  };

  return {
    handleSubmitLessonPlan,
    handleSubmit,
    handleCreateSession,
  };
};

export default useStepSubmitLogic;
