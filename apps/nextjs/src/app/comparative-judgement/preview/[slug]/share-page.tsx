"use client";

import { useMemo } from "react";

import { Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { OptionWithPrompt } from "ai-apps/comparative-judgement/state/types";
import { useCopyToClipboard } from "hooks/useCopyToClipboard";

import PreviewContent from "@/components/AppComponents/ComparativeJudgement/PreviewContent";
import Button from "@/components/Button";
import { Icon } from "@/components/Icon";
import Layout from "@/components/Layout";
import { trpc } from "@/utils/trpc";

export const ComparativeJudgementPage = ({
  slug,
  featureFlag,
}: Readonly<{ slug: string; featureFlag: boolean }>) => {
  const judgement = trpc.judgement?.getShareableComparisonFromId.useQuery({
    id: slug,
  }).data;

  const optionB = judgement?.optionB;
  const optionA = judgement?.optionA;
  const shuffledOptions = useMemo(() => {
    const randomOrder = Math.random() > 0.5;

    return randomOrder ? [optionA, optionB] : [optionB, optionA];
  }, [optionA, optionB]);

  const { copySuccess, handleCopyToClipboard } = useCopyToClipboard(
    window.location.href,
  );

  return (
    <Layout featureFlag={featureFlag}>
      <Flex
        direction={{ initial: "column", sm: "column" }}
        justify="between"
        align={{
          initial: "center",
          sm: "start",
        }}
        mb={"9"}
        className="
       relative  -mt-26 w-full py-28 before:absolute before:left-[-50vw] before:top-0 before:z-[-1] before:h-full before:w-[150vw] before:bg-lavender50
      "
      >
        <Flex className="w-full" direction={"column"} gap={"5"}>
          <Flex direction={"row"} justify={"between"}>
            <Heading as="h1" size={"8"}>
              Comparative Judgement Preview
            </Heading>
            <Button
              variant="text-link"
              icon="arrow-right"
              href="/comparative-judgement"
            >
              Go to Comparative Judgement
            </Button>
          </Flex>
          <Flex
            className="w-full md:max-w-[800px]"
            direction={"column"}
            gap={"5"}
          >
            <Text>
              This is a comparison of two versions of the answers and
              distractors created for the same question for{" "}
              {judgement?.questionForJudgement?.keyStage?.title}{" "}
              {judgement?.questionForJudgement?.subject?.title}. Our comparative
              judgement tool compares various AI generations and teacher created
              content to help us understand how to improve the quality of
              generating high quality educational content. You can try out some
              comparisons yourself.
            </Text>
            {copySuccess ? (
              <Flex>
                <Icon icon="tick" size="sm" />
                <Text>Link copied to clipboard!</Text>
              </Flex>
            ) : (
              <Button
                onClick={handleCopyToClipboard}
                icon="copy"
                variant="text-link"
              >
                Copy link to to clipboard
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>

      <Grid
        columns={{
          initial: "1",
          md: "2",
        }}
        gap={"8"}
        mb={"9"}
      >
        {shuffledOptions.map((option) => {
          const question =
            judgement?.questionForJudgement?.quizQuestion?.question;
          return (
            <PreviewContent
              key={option?.id}
              question={question}
              option={option as OptionWithPrompt}
            />
          );
        })}
      </Grid>
    </Layout>
  );
};

export default ComparativeJudgementPage;
