"use client";

import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { copyLinkToClipboard } from "ai-apps/common/copyLinkToClipboard";
import { copyTextToClipboard } from "ai-apps/common/copyTextToClipboard";

import { quizDisclaimerText } from "@/assets/text";
import Button from "@/components/Button";
import HeroContainer from "@/components/HeroContainer";
import { Icon } from "@/components/Icon";
import Layout from "@/components/Layout";

export const LessonPlanPreview = ({ planSections, featureFlag }) => {
  if (!planSections) return null;
  return (
    <Layout featureFlag={featureFlag}>
      <Container px="0" className="min-h-[800px]">
        <HeroContainer>
          <Flex direction="column" gap="4" mt="7">
            <Flex gap="5" mb="6" direction="row">
              <Button
                variant="primary"
                onClick={copyTextToClipboard}
                icon="copy"
              >
                Copy text
              </Button>
              <Button
                variant="primary"
                onClick={copyLinkToClipboard}
                icon="share"
              >
                Share link
              </Button>
            </Flex>
          </Flex>

          <Box className="mb-24">
            <Heading as="h2" size="5" className="mb-6">
              Key learning points
            </Heading>
            <ol className="list-decimal pl-10">
              {planSections?.planSections.keyLearningPoints.map(
                (learningPoint) => (
                  <li key={learningPoint.value} className={`mb-6 list-decimal`}>
                    <p>{learningPoint.value}</p>
                  </li>
                ),
              )}
            </ol>
          </Box>
          <Box className="mb-24">
            <Heading as="h2" size="5">
              Common Misconceptions
            </Heading>
            <ul className="mt-10">
              {planSections?.planSections.misconceptions.map((miscon) => {
                return (
                  <li
                    key={miscon.value.misconception}
                    className={`mb-12 flex flex-col gap-8`}
                  >
                    <p className="font-bold">{miscon.value.misconception}</p>
                    <p>{miscon.value.description}</p>
                  </li>
                );
              })}
            </ul>
          </Box>
          <Box className="copy-to-clipboard">
            <Box className="mb-24">
              <Heading as="h2" size="5">
                Keywords
              </Heading>
              <dl className="mt-10">
                {planSections?.planSections.keywords?.map((keyword) => {
                  const keywordValue = keyword.value;
                  return (
                    <Flex
                      gap="0"
                      key={keywordValue.keyword}
                      direction="column"
                      mb="5"
                    >
                      <dt key={keywordValue.keyword}>
                        <Text className="font-bold">
                          {keywordValue.keyword}
                        </Text>
                      </dt>
                      <dd>
                        <Text>{keywordValue.description}</Text>
                      </dd>
                    </Flex>
                  );
                })}
              </dl>
            </Box>
            <Box>
              <Heading as="h2" size="5" className="mb-6">
                Starter quiz
              </Heading>
              {planSections?.planSections.starterQuiz.map((question) => {
                return (
                  <Quiz question={question} key={question.question.value} />
                );
              })}
            </Box>
            <Box>
              <Heading as="h2" size="5" className="mb-6">
                Exit quiz
              </Heading>
              {planSections?.planSections.exitQuiz.map((question) => {
                return (
                  <Quiz question={question} key={question.question.value} />
                );
              })}
            </Box>
          </Box>
          <Box className="border-t-1 mb-16 mt-26 border border-black border-opacity-30" />
          <Flex
            direction={{
              initial: "column",
              sm: "row",
            }}
            gap="2"
            className="opacity-80"
          >
            <Box className="flex w-20">
              <Icon size="sm" icon="question-mark" />
            </Box>
            <Text className="copy-to-clipboard" size="2">
              {quizDisclaimerText}
            </Text>
          </Flex>
        </HeroContainer>
      </Container>
    </Layout>
  );
};

type QuizProps = {
  question: {
    question: { value: string };
    distractors: { value: string }[];
    answers: { value: string }[];
  };
};
const Quiz = ({ question }: Readonly<QuizProps>) => {
  return (
    <Box className="mt-14">
      <Text className="text-lg font-bold ">{question.question.value}</Text>
      <ul className="mt-10">
        {question.distractors.map((distractor) => {
          return (
            <li key={distractor.value} className={`mb-12 flex flex-col gap-8`}>
              <p>{distractor.value}</p>
            </li>
          );
        })}
      </ul>
      <Box className="mb-12 flex flex-col">
        <Text>Correct answer{question.answers.length >= 2 && "s"}:</Text>
        {question.answers.map((answer) => {
          return (
            <Text key={answer.value} className="font-bold">
              {answer.value}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
};

//const appsModel = new Apps(prisma);

export default LessonPlanPreview;
