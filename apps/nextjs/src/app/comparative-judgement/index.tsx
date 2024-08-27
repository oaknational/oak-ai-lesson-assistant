"use client";

import { useRef, useState } from "react";

import { KeyStageName, SubjectName } from "@oakai/core";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useFeatureFlagEnabled } from "posthog-js/react";

import ComparativeJudgement from "@/components/AppComponents/ComparativeJudgement";
import KeyStageAndSubjectPicker from "@/components/AppComponents/ComparativeJudgement/KeyStageAndSubjectPicker";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { trpc } from "@/utils/trpc";

export const ComparativeJudgementPage = (featureFlag) => {
  const newFlagEnabled = useFeatureFlagEnabled("comparative-judgement");
  //TODO remove this
  const oldFlagEnabled = useFeatureFlagEnabled("comparative-judgment");
  const flagEnabled = newFlagEnabled || oldFlagEnabled;
  const cjRef = useRef<HTMLDivElement>(null);
  const [keyStage, setKeyStage] = useState<"" | KeyStageName>("");
  const [subject, setSubject] = useState<"" | SubjectName | undefined>("");

  const [isPickingKeyStageAndSubject, setIsPickingKeyStageAndSubject] =
    useState(true);

  const availableKeyStagesAndSubjects =
    trpc.judgement.getAvailableKeyStageAndSubjectPairingsFromComparativeJudgement.useQuery(
      {},
    ).data;

  if (flagEnabled) {
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
          <Box className="w-full md:w-[60%]">
            <Heading as="h1" size={"8"} mb={"5"}>
              Comparative Judgement
            </Heading>
            <Text>
              Comparing the two versions of the multiple choice question below,
              which is the highest quality when thinking about the pedagogical
              quality of the answers and distractors? Select a Key Stage and
              Subject of your specialism to get started and we&apos;ll show you
              questions for particular year groups and topics to compare.
            </Text>
          </Box>
          <Box className="mt-20 w-full">
            {isPickingKeyStageAndSubject ? (
              <KeyStageAndSubjectPicker
                keyStage={keyStage}
                selectedSubject={subject}
                setSelectedSubject={setSubject}
                setSelectedKeyStage={setKeyStage}
                keyStageAndSubjectToFilterBy={availableKeyStagesAndSubjects}
              />
            ) : (
              <Flex direction={"column"}>
                <Text>You are comparing:</Text>
                <Text size={"5"} weight={"bold"}>
                  {keyStage}, {subject}
                </Text>
              </Flex>
            )}
          </Box>
          {keyStage && subject && (
            <Box mt={"6"}>
              <Button
                variant="primary"
                onClick={() => {
                  if (isPickingKeyStageAndSubject) {
                    cjRef.current?.scrollIntoView({ behavior: "smooth" });
                  }
                  setIsPickingKeyStageAndSubject((i) => !i);
                }}
              >
                {isPickingKeyStageAndSubject
                  ? "Start Comparing"
                  : "Change Key Stage and Subject"}
              </Button>
            </Box>
          )}
        </Flex>

        <div ref={cjRef}>
          {!isPickingKeyStageAndSubject &&
            keyStage !== "" &&
            subject !== "" && (
              <ComparativeJudgement keyStage={keyStage} subject={subject} />
            )}
        </div>
      </Layout>
    );
  }
  return null;
};

export default ComparativeJudgementPage;
