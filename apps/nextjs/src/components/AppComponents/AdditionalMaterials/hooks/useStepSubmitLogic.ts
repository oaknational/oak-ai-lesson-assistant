import * as Sentry from "@sentry/nextjs";

import { useResourcesActions } from "@/stores/ResourcesStoreProvider";
import { trpc } from "@/utils/trpc";

const useStepSubmitLogic = () => {
  const { submitLessonPlan, setStepNumber, generateMaterial } =
    useResourcesActions();

  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  // Handle submit for step 2
  const handleSubmitLessonPlan = async (params: {
    title: string;
    subject: string;
    keyStage: string;
    year: string;
  }) => {
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
      });

      setStepNumber(2);
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
    }
  };

  // Handle submit for step 3
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = () => {
    setStepNumber(3);

    void generateMaterial({
      mutateAsync: async (input) => {
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

  return {
    handleSubmitLessonPlan,
    handleSubmit,
  };
};

export default useStepSubmitLogic;
