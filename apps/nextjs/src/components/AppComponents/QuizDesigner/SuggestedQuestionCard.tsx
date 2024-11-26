import type { Dispatch } from "react";
import { useState } from "react";

import { Flex, Text } from "@radix-ui/themes";
import type { QuizAppAction } from "ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "ai-apps/quiz-designer/state/actions";
import type { PotentialQuestionsType } from "hooks/useSuggestedQuestions";

import { Icon } from "@/components/Icon";

export type SuggestedLessonCardProps = Readonly<{
  answer: PotentialQuestionsType[0];
  dispatch: Dispatch<QuizAppAction>;
  questionsWrapperRef: React.RefObject<HTMLDivElement>;
  potentialNewQuestions: PotentialQuestionsType;
  setPotentialNewQuestions: React.Dispatch<PotentialQuestionsType>;
  questionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}>;

const SuggestedLessonCard = ({
  answer: question,
  dispatch,
  questionsWrapperRef,
  potentialNewQuestions,
  setPotentialNewQuestions,
  questionRefs,
}: SuggestedLessonCardProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  return (
    <Flex
      className="rounded border border-black border-opacity-10 p-10"
      direction="column"
      justify="between"
    >
      <Flex direction="row" justify="between" align="center" mb="3">
        <Text className="text-sm">Question:</Text>
        <button
          onClick={() => {
            removeQuestionFromArray(
              question,
              potentialNewQuestions,
              setPotentialNewQuestions,
            );
          }}
        >
          <Icon icon="cross" size="sm" />
        </button>
      </Flex>
      <Flex gap="2" direction="column">
        <Text className="text-lg">{question.question}</Text>
      </Flex>

      <Flex direction="row" justify="between" mt="5">
        <button onClick={() => setShowAnswers((i) => !i)}>
          <Flex align="center" gap="1">
            <span>Answers & distractors</span>
            <Icon
              icon={showAnswers ? "chevron-up" : "chevron-down"}
              size="sm"
            />
          </Flex>
        </button>
        <button
          onClick={async () => {
            dispatch({
              type: QuizAppActions.AddPopulatedQuestion,
              question: question,
            });
            await removeQuestionFromArray(
              question,
              potentialNewQuestions,
              setPotentialNewQuestions,
            ).then(() => {
              const questionsWrapper = questionsWrapperRef.current;
              if (questionsWrapper) {
                const questionRef = questionRefs.current.find(
                  (q) => q?.id === question.question,
                );
                if (questionRef) {
                  const { top } = questionRef.getBoundingClientRect();
                  window.scrollTo({
                    top: top + window.pageYOffset - 200,
                    behavior: "smooth",
                  });
                }
              }
            });
          }}
          className="font-bold"
        >
          Add to quiz
        </button>
      </Flex>
      {showAnswers && (
        <Flex className="w-full gap-12" direction="column" mt="5">
          {question.answers.map((answer) => {
            return (
              <Flex key={answer} align="center" gap="2">
                <Flex className="rounded-full bg-pupilsGreen p-6">
                  <Icon icon="tick" size="sm" />
                </Flex>
                <p>{answer}</p>
              </Flex>
            );
          })}
          {question.distractors.map((distractor) => {
            return (
              <Flex key={distractor} align="center" gap="2">
                <Flex className="rounded-full bg-warning p-6">
                  <Icon icon="cross" size="sm" />
                </Flex>
                <p>{distractor}</p>
              </Flex>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};

async function removeQuestionFromArray(
  question: PotentialQuestionsType[0],
  potentialNewQuestions: PotentialQuestionsType,
  setPotentialNewQuestions: React.Dispatch<PotentialQuestionsType>,
) {
  const newArr = [...potentialNewQuestions];
  const index = newArr.indexOf(question);
  if (index > -1) {
    newArr.splice(index, 1);
  }
  setPotentialNewQuestions(newArr);
}

export default SuggestedLessonCard;
