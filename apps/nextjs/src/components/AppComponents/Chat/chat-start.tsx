"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useUser } from "@clerk/nextjs";
import { aiLogger } from "@oakai/logger";
import { OakIcon, OakSmallSecondaryButton } from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import { useDemoUser } from "@/components/ContextProviders/Demo";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import { useDialog } from "../DialogContext";
import ChatPanelDisclaimer from "./chat-panel-disclaimer";
import { ChatStartForm } from "./chat-start-form";
import DropDownFormWrapper from "./drop-down-section/drop-down-form-wrapper";
import EmptyScreenAccordion from "./empty-screen-accordion";

const log = aiLogger("chat");

const exampleMessages = [
  {
    heading: "History • Key stage 3 • The end of Roman Britain ",
    message:
      "Create a lesson plan about The End of Roman Britain for Key Stage 3 History that lasts 60 mins",
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedKeyStage, setSelectedKeyStage] = useState("");
  const [selectedLength, setSelectedLength] = useState("");

  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  useEffect(() => {
    setInitialPrompt(
      `Make a lesson plan for ${selectedSubject} for ${selectedKeyStage} that lasts ${selectedLength} with the title ${input}`,
    );
  }, [
    selectedSubject,
    selectedKeyStage,
    selectedLength,
    input,
    selectedSubject,
    selectedKeyStage,
    selectedLength,
    setInput,
  ]);

  console.log("initialPrompt", initialPrompt);

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
        log.info("App session created:", result);
        trackEvent("chat:send_message", { id: result.id, message });
        router.push(`/aila/${result.id}`);
      } catch (error) {
        log.error("Error creating app session:", error);
      }
    },
    [
      createAppSession,
      trpcUtils.chat.appSessions.remainingLimit,
      trackEvent,
      router,
    ],
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const [userCanSubmit, setUserCanSubmit] = useState(false);

  useEffect(() => {
    if (selectedSubject && selectedKeyStage && selectedLength && input) {
      setUserCanSubmit(true);
    } else {
      setUserCanSubmit(false);
    }
  }, [
    selectedSubject,
    selectedKeyStage,
    selectedLength,
    input,
    setUserCanSubmit,
  ]);

  const submit = useCallback(
    async (message: string) => {
      if (!selectedSubject || !selectedKeyStage || !selectedLength || !input) {
        setValidationError(
          `The following field(s) are missing: ${
            !selectedSubject ? "Subject" : ""
          }${!selectedKeyStage ? ", Key Stage" : ""}${
            !selectedLength ? ", Length" : ""
          }${!input ? ", Lesson Title" : ""}`,
        );
        return;
      }
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
          <div className="h-full w-full overflow-y-scroll p-18 px-10 sm:w-[66%]">
            <div className="mx-auto flex h-full max-w-[580px] flex-col justify-between">
              <div className="flex h-full flex-col justify-center gap-18">
                <div>
                  <h1
                    data-testid="chat-h1"
                    className="mb-11 text-3xl font-semibold capitalize"
                  >
                    Hello{userFirstName ? ", " + userFirstName : ""}
                  </h1>
                  <p className="mb-7 text-base leading-normal">
                    I&apos;m Aila, Oak&apos;s AI lesson assistant.
                    <br />
                    Tell me what you want to teach and I&apos;ll help you create
                    your lesson.
                  </p>
                </div>
                <div>
                  <div className="mb-15 flex gap-10">
                    <KeyStageDropDown
                      selectedKeyStage={selectedKeyStage}
                      setSelectedKeyStage={setSelectedKeyStage}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                    <SubjectsDropDown
                      selectedSubject={selectedSubject}
                      setSelectedSubject={setSelectedSubject}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                    <LengthDropDown
                      selectedLength={selectedLength}
                      setSelectedLength={setSelectedLength}
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                    />
                  </div>
                  <ChatStartForm
                    input={input}
                    setInput={setInput}
                    isSubmitting={isSubmitting}
                    submit={submit}
                    initialPrompt={initialPrompt}
                    userCanSubmit={userCanSubmit}
                    setValidationError={setValidationError}
                    selectedSubject={selectedSubject}
                    selectedKeyStage={selectedKeyStage}
                    selectedLength={selectedLength}
                  />
                  <p className="mt-15">{validationError && validationError}</p>
                </div>
                <div>
                  <h3 className="mb-9 mt-22 text-base font-bold">
                    Or try an example:
                  </h3>
                  <div className="flex flex-col items-start space-y-14">
                    {exampleMessages.map((message) => (
                      <Button
                        key={message.message}
                        variant="link"
                        className="pl-0"
                        onClick={async () => {
                          try {
                            trackEvent(`chat: ${message.message}`);
                            await populateAllStartChatFields({
                              setInput,
                              setSelectedKeyStage,
                              setSelectedSubject,
                              setSelectedLength,
                            });

                            if (typeof initialPrompt === "string") {
                              // wait for 0.5s to ensure the state is updated
                              setTimeout(async () => {
                                await submit(initialPrompt);
                              }, 500);
                            }
                          } catch (error) {
                            console.error(
                              "Error handling button click:",
                              error,
                            );
                          }
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

const DropDownButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-6 rounded-full border-2 border-black bg-white px-9 py-7"
  >
    <p>{children}</p>
    <div className="scale-75">
      <OakIcon iconName="chevron-down" />
    </div>
  </button>
);

const DropDownWrapper = ({ children }) => (
  <div>
    <div className="absolute left-0 top-full z-50 mt-10 max-h-[500px] w-[300px] overflow-y-scroll rounded-lg border-2 border-black bg-white">
      {children}
    </div>
  </div>
);

const SubjectsDropDown = ({
  selectedSubject,
  setSelectedSubject,
  activeDropdown,
  setActiveDropdown,
}) => {
  const subjects = [
    "Science",
    "Spanish",
    "Maths",
    "German",
    "Creative Arts",
    "Physical Development",
    "Communication and Language",
    "Computing",
    "Independent Living",
    "Music",
    "Citizenship",
    "French",
    "Physical Education",
    "History",
    "Latin",
    "Religious Education",
    "Computing (Non-GCSE)",
    "Drama",
    "Biology",
    "Chemistry",
    "Numeracy",
    "English",
    "Literacy",
    "Geography",
    "Design & Technology",
    "Expressive Arts and Design",
    "Art & Design",
    "RSHE (PSHE)",
    "PSED",
    "Understanding the World",
    "English Spelling",
    "English Reading for Pleasure",
    "English Grammar",
    "Combined Science",
    "Physics",
    "Other",
  ];

  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useOutsideClick(() => {
    if (activeDropdown === "subjects") {
      setActiveDropdown(null);
    }
  });
  return (
    <div className="relative" ref={dropdownRef}>
      <DropDownButton
        onClick={() =>
          setActiveDropdown(activeDropdown === "subjects" ? null : "subjects")
        }
      >
        {selectedSubject || "Subject"}
      </DropDownButton>
      {activeDropdown === "subjects" && (
        <DropDownWrapper>
          {subjects.map((subject) =>
            selectedSubject === "Other" ? (
              <div className="p-10" key={subject}>
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="border-black-2 w-full rounded-md border-2 border-black p-7"
                  placeholder="Enter your custom subject"
                />
                <OakSmallSecondaryButton
                  onClick={() => {
                    setSelectedSubject(customValue);
                    setActiveDropdown(null);
                  }}
                  $mt="space-between-s"
                >
                  Confirm
                </OakSmallSecondaryButton>
              </div>
            ) : (
              <button
                key={subject}
                className="block w-full px-10 py-7 text-left hover:bg-slate-300"
                onClick={() => {
                  setSelectedSubject(subject);
                  setActiveDropdown(null);
                }}
              >
                {subject}
              </button>
            ),
          )}
        </DropDownWrapper>
      )}
    </div>
  );
};

const KeyStageDropDown = ({
  selectedKeyStage,
  setSelectedKeyStage,
  activeDropdown,
  setActiveDropdown,
}) => {
  const keyStages = [
    "Key Stage 1",
    "Key Stage 2",
    "Key Stage 3",
    "Key Stage 4",
    "Other",
  ];
  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useOutsideClick(() => {
    if (activeDropdown === "keyStages") {
      setActiveDropdown(null);
    }
  });
  return (
    <div className="relative" ref={dropdownRef}>
      <DropDownButton
        onClick={() =>
          setActiveDropdown(activeDropdown === "keyStages" ? null : "keyStages")
        }
      >
        {selectedKeyStage || "Key Stage"}
      </DropDownButton>
      {activeDropdown === "keyStages" && (
        <DropDownWrapper>
          {keyStages.map((keyStage) =>
            selectedKeyStage === "Other" ? (
              <div className="p-10" key={keyStage}>
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="border-black-2 w-full rounded-md border-2 border-black p-7"
                  placeholder="Enter your custom key stage"
                />
                <OakSmallSecondaryButton
                  onClick={() => {
                    setSelectedKeyStage(customValue);
                    setActiveDropdown(null);
                  }}
                  $mt="space-between-s"
                >
                  Confirm
                </OakSmallSecondaryButton>
              </div>
            ) : (
              <button
                key={keyStage}
                className="block w-full px-10 py-7 text-left hover:bg-slate-300"
                onClick={() => {
                  setSelectedKeyStage(keyStage);
                  setActiveDropdown(null);
                }}
              >
                {keyStage}
              </button>
            ),
          )}
        </DropDownWrapper>
      )}
    </div>
  );
};

const LengthDropDown = ({
  selectedLength,
  setSelectedLength,
  activeDropdown,
  setActiveDropdown,
}) => {
  const lengths = [
    "25 mins",
    "30 mins",
    "45 mins",
    "60 mins",
    "90 mins",
    "Other",
  ];
  const [customValue, setCustomValue] = useState<number | null>(null);
  const dropdownRef = useOutsideClick(() => {
    if (activeDropdown === "length") {
      setActiveDropdown(null);
    }
  });
  return (
    <div className="relative" ref={dropdownRef}>
      <DropDownButton
        onClick={() =>
          setActiveDropdown(activeDropdown === "length" ? null : "length")
        }
      >
        {selectedLength || "Length"}
      </DropDownButton>
      {activeDropdown === "length" && (
        <DropDownWrapper>
          {lengths.map((length) =>
            selectedLength === "Other" ? (
              <div className="p-10" key={length}>
                <input
                  type="number"
                  value={customValue || ""}
                  onChange={(e) => setCustomValue(parseInt(e.target.value))}
                  className="border-black-2 w-full rounded-md border-2 border-black p-7"
                  placeholder="Enter length in mins"
                />
                <OakSmallSecondaryButton
                  onClick={() => {
                    if (customValue) {
                      setSelectedLength(`${customValue} mins`);
                      setActiveDropdown(null);
                    }
                  }}
                  $mt="space-between-s"
                >
                  Confirm
                </OakSmallSecondaryButton>
              </div>
            ) : (
              <button
                key={length}
                className="block w-full px-10 py-7 text-left hover:bg-slate-300"
                onClick={() => {
                  setSelectedLength(length);
                  setActiveDropdown(null);
                }}
              >
                {length}
              </button>
            ),
          )}
        </DropDownWrapper>
      )}
    </div>
  );
};

export function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
}

async function populateAllStartChatFields({
  setInput,
  setSelectedKeyStage,
  setSelectedSubject,
  setSelectedLength,
}: {
  setInput: (value: string) => void;
  setSelectedKeyStage: (value: string) => void;
  setSelectedSubject: (value: string) => void;
  setSelectedLength: (value: string) => void;
}) {
  setInput("roman britain");
  setSelectedKeyStage("Key Stage 3");
  setSelectedSubject("History");
  setSelectedLength("60 mins");
}
