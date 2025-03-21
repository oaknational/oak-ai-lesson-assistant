"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { aiLogger } from "@oakai/logger";

import { useUser } from "@clerk/nextjs";
import { Flex } from "@radix-ui/themes";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import { useDialog } from "../DialogContext";
import ChatPanelDisclaimer from "./chat-panel-disclaimer";
import { ChatStartForm } from "./chat-start-form";
import EmptyScreenAccordion from "./empty-screen-accordion";

const log = aiLogger("chat");

const exampleMessages = (
  t: (key: string, replacements?: Record<string, string | number>) => string,
) => [
  {
    heading: t("chat.historyExample"),
    message: t("chat.exampleMessage"),
  },
];

type ChatStartProps = {
  keyStage?: string;
  subject?: string;
  unitTitle?: string;
  searchExpression?: string;
};

export function ChatStart({
  keyStage,
  subject,
  unitTitle,
  searchExpression,
}: Readonly<ChatStartProps>) {
  const { user } = useUser();
  const userFirstName = user?.firstName;
  const { trackEvent } = useAnalytics();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setDialogWindow } = useDialog();
  const router = useRouter();
  const demo = useDemoUser();
  const createAppSession = trpc.chat.appSessions.create.useMutation();
  const trpcUtils = trpc.useUtils();
  const { t } = useTranslation();

  useEffect(() => {
    if (keyStage || subject || unitTitle || searchExpression) {
      setInput(
        createStartingPromptFromSearchParams(
          t,
          keyStage,
          subject,
          unitTitle,
          searchExpression,
        ),
      );
    }
  }, [keyStage, subject, unitTitle, searchExpression, t]);

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

  const submit = useCallback(
    (message: string) => {
      if (demo.isDemoUser) {
        setDialogWindow("demo-interstitial");
      } else {
        setIsSubmitting(true);
        create(message).catch((error) => {
          Sentry.captureException(error);
          toast.error("Failed to start the chat");
        });
      }
    },
    [create, setDialogWindow, demo.isDemoUser, setIsSubmitting],
  );

  const interstitialSubmit = useCallback(() => {
    create(input).catch((error) => {
      Sentry.captureException(error);
      toast.error("Failed to start the chat");
    });
  }, [create, input]);

  const messages = React.useMemo(() => exampleMessages(t), [t]);

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
        className="h-[100vh] min-h-screen bg-lavender30 pt-26"
      >
        <div className="flex h-full justify-between">
          <div className="h-full w-full overflow-y-scroll p-18 px-10 sm:w-[66%]">
            <div className="mx-auto flex h-full max-w-[580px] flex-col justify-between">
              <div className="flex h-full flex-col justify-center gap-18">
                <div>
                  <h1
                    data-testid="chat-h1"
                    className="mb-11 text-3xl font-semibold capitalize"
                  >
                    {t("common.hello")}
                    {userFirstName ? ", " + userFirstName : ""}
                  </h1>
                  <p className="mb-7 text-base leading-normal">
                    {t("chat.greeting")}
                    <br />
                    {t("chat.instruction")}
                  </p>
                </div>
                <div>
                  <p className="mb-13 text-xl font-bold">
                    {t("chat.question")}
                  </p>
                  <ChatStartForm
                    input={input}
                    setInput={setInput}
                    isSubmitting={isSubmitting}
                    submit={submit}
                  />
                </div>
                <div>
                  <h3 className="mb-9 mt-22 text-base font-bold">
                    {t("chat.tryExample")}
                  </h3>
                  <div className="flex flex-col items-start space-y-14">
                    {messages.map((message) => (
                      <Button
                        key={message.message}
                        variant="link"
                        className="pl-0"
                        onClick={() => {
                          trackEvent(`chat: ${message.message}`);
                          setInput(message.message);
                          submit(message.message);
                        }}
                      >
                        <span className="mt-14 pb-7 text-left text-base font-light underline sm:mt-0">
                          {message.heading}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <ChatPanelDisclaimer size="sm" />
            </div>
          </div>
          <div className="hidden h-full w-[34%] items-center overflow-y-scroll bg-white px-25 pb-9 sm:flex">
            <div className="relative -mt-45 w-full">
              <p className="mb-10 text-xl font-bold">
                {t("chat.lessonDownloads")}
              </p>
              <div className="absolute inset-x-0 top-full">
                <p className="mb-10 text-base">
                  {t("chat.downloadExplanation")}
                </p>
                <EmptyScreenAccordion />
              </div>
            </div>
          </div>
        </div>
      </Flex>
    </DialogRoot>
  );
}

function createStartingPromptFromSearchParams(
  t: (key: string, replacements?: Record<string, string | number>) => string,
  keyStage?: string,
  subject?: string,
  unitTitle?: string,
  searchExpression?: string,
): string {
  let prompt = t("prompts.createLessonPlan");

  if (keyStage) {
    prompt += ` ${t("prompts.forKeyStage", { keyStage })}`;
  }

  if (subject) {
    prompt += ` ${t("prompts.aboutSubject", { subject })}`;
  }

  if (unitTitle) {
    prompt += ` ${t("prompts.focusingOnUnit", { unitTitle })}`;
  }

  if (searchExpression) {
    prompt += ` ${t("prompts.titled", { searchExpression })}`;
  }

  prompt += ".";

  return prompt.trim();
}
