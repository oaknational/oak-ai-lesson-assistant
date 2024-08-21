import { Dispatch, SetStateAction, useMemo } from "react";

import { Box, Grid, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { Option } from "../../../ai-apps/comparative-judgement/state/types";
import JudgementHeading from "./JudgementHeading";
import QuestionButton from "./QuestionButton";
import ReasonForChoosing from "./ReasonForChoosing";

const reasoningOuterStyles = cva("delay-75 duration-500", {
  variants: {
    open: {
      true: "h-[200px] opacity-100",
      false: "h-0 opacity-0",
    },
    defaultVariants: {
      open: false,
    },
  },
});

type JudgementContentProps = {
  title: string;
  optionA: Option;
  optionB: Option;
  skipQuestion: () => void;
  questionText?: string | null;
  setFlaggedItems: Dispatch<SetStateAction<string>>;
  setWinningId: Dispatch<SetStateAction<string>>;
  winnerId: string | null;
  setReasonForChoice: (reason: string) => void;
  clearReasonForChoice: () => void;
  chooseQuestion: () => void;
  judgementId: string | undefined;
  lessonDescription: string;
};

const JudgementContent = ({
  title,
  optionA,
  optionB,
  skipQuestion,
  questionText,
  setFlaggedItems,
  setWinningId,
  winnerId,
  setReasonForChoice,
  clearReasonForChoice,
  chooseQuestion,
  judgementId,
  lessonDescription,
}: Readonly<JudgementContentProps>) => {
  const shuffledOptions = useMemo(() => {
    const randomOrder = Math.random() > 0.5;

    return randomOrder ? [optionA, optionB] : [optionB, optionA];
  }, [optionA, optionB]);
  return (
    <Box>
      <JudgementHeading
        title={title}
        skipQuestion={skipQuestion}
        judgementId={judgementId}
        lessonDescription={lessonDescription}
      />
      <Text>
        Pick the best quality set of answers and distractors from the options
        below.
      </Text>
      <Box className={reasoningOuterStyles({ open: !!winnerId })}>
        <ReasonForChoosing
          setReasonForChoice={setReasonForChoice}
          clearReasonForChoice={clearReasonForChoice}
          chooseQuestion={chooseQuestion}
          focus={!!winnerId}
        />
      </Box>

      <Grid
        columns={{
          initial: "1",
          md: "2",
        }}
        gap="8"
        mb="9"
        mt={winnerId ? "9" : "0"}
      >
        {shuffledOptions.map((option) => (
          <QuestionButton
            key={option?.id}
            option={option}
            question={questionText!}
            setFlaggedItems={setFlaggedItems}
            setWinningId={setWinningId}
            winnerId={winnerId}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default JudgementContent;
