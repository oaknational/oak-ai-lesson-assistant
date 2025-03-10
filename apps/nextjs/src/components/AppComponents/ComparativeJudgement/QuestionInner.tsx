import Markdown from "react-markdown";

import { Box, Flex, Text } from "@radix-ui/themes";

import { Icon } from "@/components/Icon";
import { toSentenceCase } from "@/utils/toSentenceCase";

type QuestionInnerProps = {
  answerAndDistractorArray: {
    value: string;
  }[];
  answers: {
    value: string;
  }[];
  question: string;
};

const QuestionInner = ({
  answerAndDistractorArray,
  question,
  answers,
}: Readonly<QuestionInnerProps>) => {
  return (
    <>
      <span className="mb-16">
        <Text size={"5"}>
          <Markdown>{question}</Markdown>
        </Text>
      </span>
      <ul>
        {answerAndDistractorArray.map((answerAndDistractor) => {
          const isAnswerInQuestion = answers.some(
            (qa) => qa.value === answerAndDistractor.value,
          );
          if (isAnswerInQuestion) {
            return (
              <li key={answerAndDistractor.value}>
                <Flex
                  align={"center"}
                  gap={"1"}
                  justify={"start"}
                  className="relative mb-8 w-fit rounded-lg bg-aqua py-5 pl-18 pr-8"
                >
                  <Box className="absolute bottom-0 left-0 top-0 flex h-full w-18 items-center justify-center">
                    <Icon icon="tick" size="sm" />
                  </Box>
                  <Text size={"3"} className="font-bold">
                    <Markdown>{answerAndDistractor.value}</Markdown>
                  </Text>
                </Flex>
              </li>
            );
          }
          return (
            <li key={answerAndDistractor.value}>
              <div className="mb-8 pl-18" key={answerAndDistractor.value}>
                <Text size={"3"}>
                  <Markdown>
                    {toSentenceCase(answerAndDistractor.value)}
                  </Markdown>
                </Text>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default QuestionInner;
