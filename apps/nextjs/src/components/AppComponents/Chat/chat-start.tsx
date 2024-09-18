"use client";

import React, { useCallback, useState } from "react";

import { useRouter } from "#next/navigation";
import { useUser } from "@clerk/nextjs";
import { Flex } from "@radix-ui/themes";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import { useDialog } from "../DialogContext";
import ChatPanelDisclaimer from "./chat-panel-disclaimer";
import { ChatStartForm } from "./chat-start-form";
import EmptyScreenAccordion from "./empty-screen-accordian";

const exampleMessages = [
  {
    heading: "History • Key stage 3 • The end of Roman Britain ",
    message: `Create a lesson plan about The End of Roman Britain for Key Stage 3 History`,
  },
];

export function ChatStart() {
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

  const create = useCallback(
    async (message: string) => {
      try {
        const result = await createAppSession.mutateAsync(
          { appId: "lesson-planner", message },
          {
            onSuccess: () => {
              trpcUtils.chat.appSessions.remainingLimit.invalidate();
            },
          },
        );

        console.log("App session created:", result);
        trackEvent("chat:send_message", {
          id: result.id,
          message,
        });

        router.push(`/aila/${result.id}`);
      } catch (error) {
        console.error("Error creating app session:", error);
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
    async (message: string) => {
      if (demo.isDemoUser) {
        setDialogWindow("demo-interstitial");
      } else {
        setIsSubmitting(true);
        create(message);
      }
    },
    [create, setDialogWindow, demo.isDemoUser, setIsSubmitting],
  );

  const interstitialSubmit = useCallback(async () => {
    create(input);
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
        className="h-[100vh] min-h-screen bg-lavender30 pt-26"
      >
        <div className="flex h-full justify-between">
          <div className="h-full w-full overflow-y-scroll  p-18  px-10 sm:w-[66%]">
            <div className="mx-auto flex h-full max-w-[580px] flex-col justify-between">
              <div className="flex h-full flex-col justify-center gap-18">
                <div>
                  <h1
                    data-testid="chat-h1"
                    className="mb-11 text-3xl font-semibold capitalize"
                  >
                    Hello{userFirstName ? ", " + userFirstName : ""}
                  </h1>
                  <p className="mb-7  text-base leading-normal">
                    I&apos;m Aila, Oak&apos;s AI lesson assistant.
                    <br />
                    Tell me what you want to teach and I&apos;ll help you create
                    your lesson.
                  </p>
                </div>
                <div>
                  <p className="mb-13 text-xl font-bold">
                    What do you want to teach?
                  </p>
                  <ChatStartForm
                    input={input}
                    setInput={setInput}
                    isSubmitting={isSubmitting}
                    submit={submit}
                  />
                </div>
                <div>
                  <h3 className=" mb-9 mt-22 text-base font-bold">
                    Or try an example:
                  </h3>
                  <div className=" flex flex-col items-start space-y-14">
                    {exampleMessages.map((message) => (
                      <Button
                        key={message.message}
                        variant="link"
                        className=" pl-0"
                        onClick={async () => {
                          trackEvent(`chat: ${message.message}`);
                          setInput(message.message);
                          await submit(message.message);
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
          <div className="hidden h-full w-[34%] items-center overflow-y-scroll bg-white px-25  pb-9 sm:flex">
            <div className="relative -mt-45 w-full">
              <p className="mb-10 text-xl font-bold">Lesson downloads</p>
              <div className="absolute inset-x-0 top-full">
                <p className="mb-10 text-base">
                  Once you&apos;ve finished, you&apos;ll be able to download a
                  range of editable lesson resources.
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