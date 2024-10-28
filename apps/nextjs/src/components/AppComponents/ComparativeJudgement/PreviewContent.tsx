import { Box, Flex, Text } from "@radix-ui/themes";
import type {
  AnswerAndDistractor,
  OptionWithPrompt,
} from "ai-apps/comparative-judgement/state/types";

import { sortAlphabetically } from "@/utils/alphabetiseArray";

import PromptTemplate from "./PromptTemplate";
import QuestionInner from "./QuestionInner";

type PreviewContentProps = {
  option: OptionWithPrompt;
  question?: string;
};

const PreviewContent = ({ option, question }: PreviewContentProps) => {
  if (!option?.answerAndDistractor) return null;
  const answersAndDistractors = option?.answerAndDistractor;
  const { answers, distractors } = answersAndDistractors;

  const answerAndDistractorArray = [...answers, ...distractors];
  sortAlphabetically(answerAndDistractorArray);
  if (!question) return null;
  return (
    <Flex key={option?.id} direction={"column"} gap={"4"}>
      <Flex
        direction={"column"}
        gap="2"
        className="rounded-xl border border-black border-opacity-70 p-24"
      >
        <QuestionInner
          answerAndDistractorArray={answerAndDistractorArray}
          question={question}
          answers={answers}
        />
      </Flex>

      <Box>
        <Text className="opacity-80">
          {option.isOakQuestion ? "Created by a Human" : "Created by Oak AI"}
        </Text>
        {!option.isOakQuestion && (
          <PromptTemplate
            template={option.prompt.template}
            identifier={option.prompt.identifier}
          />
        )}
      </Box>
    </Flex>
  );
};

export default PreviewContent;
