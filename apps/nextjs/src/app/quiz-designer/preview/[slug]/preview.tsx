"use client";

import { Box, Container, Flex, Text } from "@radix-ui/themes";

import { copyLinkToClipboard } from "@/ai-apps/common/copyLinkToClipboard";
import { copyTextToClipboard } from "@/ai-apps/common/copyTextToClipboard";
import { quizDisclaimerText } from "@/assets/text";
import ChatButton from "@/components/AppComponents/Chat/ui/chat-button";
import HeroContainer from "@/components/HeroContainer";
import { Icon } from "@/components/Icon";
import Layout from "@/components/Layout";

export default function QuizPreview(questions) {
  const sharedData = questions;
  if (!sharedData) return null;
  return (
    <Layout>
      <Container px="0" className="min-h-[800px]">
        <HeroContainer>
          <Flex direction="column" gap="4" mt="7">
            <Flex gap="5" mb="6" direction="row">
              <ChatButton variant="primary" onClick={copyTextToClipboard}>
                Copy quiz text
              </ChatButton>
              <ChatButton variant="primary" onClick={copyLinkToClipboard}>
                Share link
              </ChatButton>
            </Flex>
          </Flex>

          {sharedData?.questions?.questions?.map((question, index) => {
            const allOptions = [...question.answers, ...question.distractors];

            return (
              <div key={index} className="copy-to-clipboard my-14">
                <p>Question {index + 1}.</p>
                <p className="mb-8 text-xl font-semibold">
                  {question.question.value}
                </p>
                <ul>
                  {allOptions.map((option, optionIndex) => (
                    <li key={optionIndex}>
                      {String.fromCharCode(97 + optionIndex)}) {option.value}
                    </li>
                  ))}
                </ul>
                <p className="mt-14 font-semibold">Correct answer:</p>
                <p>
                  {question.answers.map((answer) => answer.value).join(", ")}
                </p>
              </div>
            );
          })}
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
}
