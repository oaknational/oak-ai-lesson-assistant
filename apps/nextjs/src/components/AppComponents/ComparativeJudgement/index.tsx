import { useCallback, useState } from "react";

import type { KeyStageName, SubjectName } from "@oakai/core";
import { Flex } from "@radix-ui/themes";

import { Icon } from "@/components/Icon";
import useQuestionsForJudgement from "@/hooks/useQuestionsForJudgement";

import JudgementContent from "./JudgementContent";
import JudgementFeedbackDialog, {
  FeedbackDialogRoot,
} from "./JudgementFeedbackDialog";

type ComparativeJudgementProps = {
  keyStage: KeyStageName;
  subject?: SubjectName;
};

const ComparativeJudgement = ({
  keyStage,
  subject,
}: Readonly<ComparativeJudgementProps>) => {
  const {
    data,
    questionText,
    optionA,
    optionB,
    skipQuestion,
    chooseQuestion,
    setReasonForChoice,
    winnerId,
    setWinnerId,
    isLoading,
    id: judgementId,
    lessonDescription,
  } = useQuestionsForJudgement({
    keyStage,
    subject,
  });

  const [feedbackDialogIsOpen, setFeedbackDialogIsOpen] = useState(false);
  const closeFeedbackDialog = useCallback(() => {
    setFeedbackDialogIsOpen(false);
  }, []);
  const [flaggedOption, setFlaggedOption] = useState<string>("");

  return (
    <FeedbackDialogRoot
      open={feedbackDialogIsOpen}
      onOpenChange={setFeedbackDialogIsOpen}
    >
      <JudgementFeedbackDialog
        closeDialog={closeFeedbackDialog}
        flaggedItem={flaggedOption}
        judgementId={data?.id ?? ""}
        flaggedAnswerAndDistractorId={flaggedOption}
      />

      {keyStage && subject && !data && (
        <Flex align="center" justify="center" my="9">
          <p>
            There are no remaining comparisons for {keyStage} {subject}
          </p>
        </Flex>
      )}
      {isLoading && (
        <div className="flex min-h-[500px] w-full min-w-18 items-center justify-center">
          <Icon
            icon="reload"
            size="md"
            color="black"
            className="animate-spin"
          />
        </div>
      )}

      {!isLoading && data && (
        <JudgementContent
          key="judgement-content"
          title={data?.questionForJudgement?.quizQuestion?.lesson.title ?? ""}
          lessonDescription={lessonDescription}
          setFlaggedItems={setFlaggedOption}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          skipQuestion={skipQuestion}
          questionText={questionText}
          optionA={optionA}
          optionB={optionB}
          setWinningId={setWinnerId}
          winnerId={winnerId}
          setReasonForChoice={setReasonForChoice}
          clearReasonForChoice={() => setReasonForChoice("")}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          chooseQuestion={chooseQuestion}
          judgementId={judgementId}
        />
      )}
    </FeedbackDialogRoot>
  );
};

export default ComparativeJudgement;
