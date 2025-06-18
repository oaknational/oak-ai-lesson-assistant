"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { aiLogger } from "@oakai/logger";

import { useUser } from "@clerk/nextjs";
import {
  OakFlex,
  OakLI,
  OakP,
  OakPrimaryButton,
  OakUL,
} from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";

import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import ChatPanelDisclaimer from "./chat-panel-disclaimer";
import EmptyScreenAccordion from "./empty-screen-accordion";

const log = aiLogger("chat");

export const exampleMessages = [
  {
    heading: "History • Key stage 3 • The end of Roman Britain ",
    message:
      "Create a lesson plan about the end of Roman Britain for key stage 3 history",
  },
];

// default styling is being overridden here by tailwind, we can remove this when re removing tailwind
const StyledUL = styled(OakUL)`
  list-style-type: disc;
  margin-top: 1em;
  margin-bottom: 1em;
  /* margin-left: 40px; */
  padding-left: 20px;
`;

type AilaStartProps = {
  keyStage?: string;
  subject?: string;
  unitTitle?: string;
  searchExpression?: string;
};

export function AilaStart({
  keyStage,
  subject,
  unitTitle,
  searchExpression,
}: Readonly<AilaStartProps>) {
  const { trackEvent } = useAnalytics();
  const [input, setInput] = useState("");
  const router = useRouter();
  const { track } = useAnalytics();

  const createAppSession = trpc.chat.appSessions.create.useMutation();
  const trpcUtils = trpc.useUtils();

  useEffect(() => {
    if (keyStage || subject || unitTitle || searchExpression) {
      setInput(
        createStartingPromptFromSearchParams(
          keyStage,
          subject,
          unitTitle,
          searchExpression,
        ),
      );
    }
  }, [keyStage, subject, unitTitle, searchExpression]);

  const create = useCallback(
    async (message: string) => {
      try {
        const result = await createAppSession.mutateAsync(
          { appId: "lesson-planner", message },
          {
            onSuccess: () => {
              trpcUtils.chat.appSessions.remainingLimit
                .invalidate()
                .catch((e) => {
                  Sentry.captureException(e);
                  toast.error("Failed to invalidate remaining limit");
                });
            },
          },
        );

        log.info("App session created:", result);
        trackEvent("chat:send_message", {
          id: result.id,
          message,
        });

        router.push(`/aila/${result.id}`);
      } catch (error) {
        log.error("Error creating app session:", error);
        Sentry.captureException(error);
        toast.error("Failed to start the chat");
      }
    },
    [
      createAppSession,
      trpcUtils.chat.appSessions.remainingLimit,
      trackEvent,
      router,
    ],
  );

  const interstitialSubmit = useCallback(() => {
    create(input).catch((error) => {
      Sentry.captureException(error);
      toast.error("Failed to start the chat");
    });
  }, [create, input]);

  return (
    <DialogRoot>
      <DialogContents
        chatId={undefined}
        lesson={{}}
        submit={interstitialSubmit}
      />
      <Flex
        direction="column"
        justify="center"
        className="min-h-screen bg-lavender30 pt-26"
      >
        <OakFlexWithHeight
          $flexDirection="column"
          $justifyContent="space-between"
          $maxWidth="all-spacing-23"
          $mh="auto"
          $gap="space-between-l"
          $ph={["inner-padding-l", "inner-padding-none"]}
        >
          <OakFlex $flexDirection={["column", "row"]} $gap="space-between-l">
            <OakFlex
              $background={"bg-primary"}
              $flexDirection="column"
              $gap="all-spacing-2"
              $pa="inner-padding-xl2"
            >
              <OakFlex $flexDirection="column" $gap="all-spacing-2">
                <OakP $font="heading-5">Create a lesson with AI</OakP>
                <OakP $font="body-2">
                  Aila will guide you step-by-step to create and download a
                  tailor-made lesson, including:
                </OakP>
              </OakFlex>
              <EmptyScreenAccordion />
              <OakPrimaryButton
                element={Link}
                href="/aila/lesson-plan"
                iconName="arrow-right"
                isTrailingIcon={true}
              >
                Create a lesson
              </OakPrimaryButton>
            </OakFlex>
            <Card>
              <OakFlex $flexDirection="column" $gap="all-spacing-2">
                <OakP $font="heading-5">Create teaching materials with AI</OakP>
                <OakP>
                  Enhance lessons with a range of teaching materials, including:
                </OakP>
                <StyledUL>
                  <OakLI $mv={"space-between-xs"}>Glossaries</OakLI>
                  <OakLI $mv={"space-between-xs"}>Comprehension tasks</OakLI>
                  <OakLI $mt={"space-between-xs"}>Quizzes</OakLI>
                </StyledUL>
              </OakFlex>
              <OakPrimaryButton
                element={Link}
                href="/aila/teaching-materials"
                iconName="arrow-right"
                isTrailingIcon={true}
                onClick={() => {
                  track.createTeachingMaterialsInitiated({
                    platform: "aila-beta",
                    product: "ai lesson assistant",
                    engagementIntent: "use",
                    componentType: "create_additional_materials_button",
                    eventVersion: "2.0.0",
                    analyticsUseCase: "Teacher",
                    isLoggedIn: Boolean(user),
                  });
                }}
              >
                Create teaching materials
              </OakPrimaryButton>
            </Card>
          </OakFlex>
          <OakFlex $mt="space-between-l">
            <ChatPanelDisclaimer size="sm" />
          </OakFlex>
        </OakFlexWithHeight>
      </Flex>
    </DialogRoot>
  );
}

const OakFlexWithHeight = styled(OakFlex)`
  height: 80%;
`;

const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <OakFlex50
      $flexDirection="column"
      $gap="all-spacing-6"
      $background="white"
      $borderRadius="border-radius-s"
      $pa="inner-padding-xl2"
    >
      {children}
    </OakFlex50>
  );
};

const OakFlex50 = styled(OakFlex)`
  width: 50%;
  height: fit-content;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

function createStartingPromptFromSearchParams(
  keyStage?: string,
  subject?: string,
  unitTitle?: string,
  searchExpression?: string,
): string {
  let prompt = "Create a lesson plan";

  if (keyStage) {
    prompt += ` for ${keyStage}`;
  }

  if (subject) {
    prompt += ` about ${subject}`;
  }

  if (unitTitle) {
    prompt += `, focusing on the unit "${unitTitle}"`;
  }

  if (searchExpression) {
    prompt += ` titled "${searchExpression}"`;
  }

  prompt += ".";

  return prompt.trim();
}
