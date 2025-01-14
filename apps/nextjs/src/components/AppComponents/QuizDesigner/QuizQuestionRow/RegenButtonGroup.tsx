import { Flex } from "@radix-ui/themes";

import type { UseGenerationStatus } from "@/hooks/useGeneration";
import { isGenerationHookLoading } from "@/hooks/useGeneration";
import { trpc } from "@/utils/trpc";

import GenerateButton from "../GenerateAllButton";

export type RegenButtonGroupProps = Readonly<{
  requestRegenerateAnswersGeneration: () => void;
  requestRegenerateAllDistractorsGeneration: () => void;
  answersStatus: UseGenerationStatus;
  distractorStatus: UseGenerationStatus;
}>;

const RegenButtonGroup = (props: RegenButtonGroupProps) => {
  const {
    requestRegenerateAnswersGeneration,
    requestRegenerateAllDistractorsGeneration,
    distractorStatus,
    answersStatus,
  } = props;

  const promptTimings = trpc.app.timings.useQuery({
    appSlug: "quiz-generator",
    promptSlug: "regenerate-all-distractors-rag",
  });

  const medianTimeTakenForPrompt =
    promptTimings.data?.["median-generation-total-duration-ms"];

  const isAnswerLoading = isGenerationHookLoading(answersStatus);
  const isDistractorLoading = isGenerationHookLoading(distractorStatus);

  return (
    <Flex direction="row" className="gap-10">
      <GenerateButton
        isLoading={isDistractorLoading}
        onClick={() => {
          requestRegenerateAllDistractorsGeneration();
        }}
        icon="reload"
        buttonText="Regenerate all distractors"
        promptID="regenerate-all-distractors-rag"
        promptDescription="This prompt will regenerate all distractors based on the question you asked and the accepted answer(s)."
        estimatedDurationMs={medianTimeTakenForPrompt}
      />

      <GenerateButton
        buttonText="Regenerate answers"
        onClick={() => {
          requestRegenerateAnswersGeneration();
        }}
        icon="reload"
        isLoading={isAnswerLoading}
        promptID="regenerate-answer-rag"
        promptDescription="This prompt will regenerate all answer(s) "
        estimatedDurationMs={medianTimeTakenForPrompt}
      />
    </Flex>
  );
};

export default RegenButtonGroup;
