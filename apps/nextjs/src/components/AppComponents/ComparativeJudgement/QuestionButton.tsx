import type { Dispatch } from "react";

import { Flex } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import Button from "@/components/Button";
import { sortAlphabetically } from "@/utils/alphabetiseArray";

import type {
  AnswerAndDistractor,
  Option,
} from "../../../ai-apps/comparative-judgement/state/types";
import { FeedbackDialogTrigger } from "./JudgementFeedbackDialog";
import QuestionInner from "./QuestionInner";

const questionButtonStyles = cva(
  "relative flex h-full w-full flex-col items-start justify-start rounded-xl border border-black bg-white p-10 text-left shadow-lg delay-100 duration-150 hover:shadow-2xl sm:p-22",
  {
    variants: {
      winnerId: {
        true: "border-2 border-pupilsAccentPink border-opacity-100",
        false: "border-opacity-25 hover:border-opacity-75",
      },
    },
  },
);

const QuestionButton = ({
  option,
  question,
  winnerId,
  setFlaggedItems,

  setWinningId,
}: Readonly<QuestionButtonProps>) => {
  const answersAndDistractors =
    option?.answerAndDistractor as AnswerAndDistractor;
  const { answers, distractors } = answersAndDistractors;

  const answerAndDistractorArray = [...answers, ...distractors];
  sortAlphabetically(answerAndDistractorArray);
  const optionId = option?.id ? option.id : "";
  return (
    <Flex
      direction="column"
      gap="5"
      justify="center"
      align="center"
      className="w-full"
    >
      <div
        className={questionButtonStyles({
          winnerId: winnerId === optionId,
        })}
      >
        <QuestionInner
          answerAndDistractorArray={answerAndDistractorArray}
          question={question}
          answers={answers}
        />
        <button
          className="absolute inset-0 z-10 opacity-0"
          onClick={() => {
            setWinningId(optionId);
          }}
        >
          <span>Oak question: {option?.isOakQuestion?.toString()}</span>
        </button>
      </div>
      <FeedbackDialogTrigger asChild>
        <Button
          icon="warning"
          variant="text-link"
          onClick={() => {
            setFlaggedItems(optionId);
          }}
        >
          Flag
        </Button>
      </FeedbackDialogTrigger>
    </Flex>
  );
};

type QuestionButtonProps = {
  question: string;
  option: Option;
  winnerId: string | null;
  setFlaggedItems: Dispatch<React.SetStateAction<string>>;
  setWinningId: Dispatch<React.SetStateAction<string>>;
};

export default QuestionButton;
