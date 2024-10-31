import { useCallback, useRef, useState } from "react";

import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import type { AilaUserModificationAction } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { OakBox, OakP, OakRadioGroup } from "@oaknational/oak-components";
import { TextArea } from "@radix-ui/themes";

import {
  useChatInteraction,
  useChatLessonPlan,
  useChatMessages,
} from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
import type { FeedbackOption } from "./drop-down-form-wrapper";
import { DropDownFormWrapper } from "./drop-down-form-wrapper";
import { SmallRadioButton } from "./small-radio-button";

const log = aiLogger("chat");

// Type guard to check if the value is a plain object
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const modifyOptions = [
  {
    label: "Make it easier",
    enumValue: "MAKE_IT_EASIER",
    chatMessage: "easier",
  },
  {
    label: "Make it harder",
    enumValue: "MAKE_IT_HARDER",
    chatMessage: "harder",
  },
  {
    label: "Shorten content",
    enumValue: "SHORTEN_CONTENT",
    chatMessage: "shorter",
  },
  {
    label: "Add more detail",
    enumValue: "ADD_MORE_DETAIL",
    chatMessage: "more detailed",
  },
  { label: "Other", enumValue: "OTHER" },
] as const;

type ModifyButtonProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
};

const ModifyButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: ModifyButtonProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userFeedbackText, setUserFeedbackText] = useState("");
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const { append } = useChatInteraction();
  const { id } = useChatLessonPlan();
  const { messages } = useChatMessages();

  const { mutateAsync } = trpc.chat.chatFeedback.modifySection.useMutation();

  const lastAssistantMessage = getLastAssistantMessage(messages);

  const prepareSectionValue = useCallback(
    (
      value: LessonPlanSectionWhileStreaming,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): string | any[] | Record<string, unknown> => {
      if (
        typeof value === "string" ||
        Array.isArray(value) ||
        isPlainObject(value)
      ) {
        return value;
      }
      // For numbers or any other types, convert to string
      return String(value);
    },
    [],
  );
  const recordUserModifySectionContent = useCallback(async () => {
    if (selectedRadio && lastAssistantMessage) {
      const payload = {
        chatId: id,
        messageId: lastAssistantMessage.id,
        sectionPath,
        sectionValue: prepareSectionValue(sectionValue),
        action: selectedRadio.enumValue,
        actionOtherText: userFeedbackText || null,
      };
      await mutateAsync(payload);
    }
  }, [
    selectedRadio,
    lastAssistantMessage,
    id,
    sectionPath,
    prepareSectionValue,
    sectionValue,
    userFeedbackText,
    mutateAsync,
  ]);

  const modifySection = useCallback(
    async (option: FeedbackOption<AilaUserModificationAction>) => {
      const message =
        option.label === "Other"
          ? `For the ${sectionTitle}, ${userFeedbackText}`
          : `Make the ${sectionTitle} ${option.chatMessage?.toLowerCase()}`;

      await Promise.all([
        append({
          content: message,
          role: "user",
        }),
        recordUserModifySectionContent(),
      ]);
    },
    [sectionTitle, userFeedbackText, append, recordUserModifySectionContent],
  );

  const handleModifySection = useCallback(
    (option: FeedbackOption<AilaUserModificationAction>) => {
      void modifySection(option);
    },
    [modifySection],
  );

  const handleModifyClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <OakBox $position="relative" ref={dropdownRef}>
      <ActionButton
        onClick={handleModifyClick}
        tooltip="Aila can help improve this section"
      >
        Modify
      </ActionButton>

      {isOpen && (
        <DropDownFormWrapper
          onClickActions={handleModifySection}
          setIsOpen={setIsOpen}
          selectedRadio={selectedRadio}
          title={`Ask Aila to modify ${sectionTitle.toLowerCase()}:`}
          buttonText={"Modify section"}
          isOpen={isOpen}
          dropdownRef={dropdownRef}
        >
          <OakRadioGroup
            name={`drop-down-${modifyOptions[0].enumValue}`}
            $flexDirection="column"
            $gap="space-between-s"
            $background="white"
          >
            {modifyOptions.map((option) => {
              return (
                <SmallRadioButton
                  id={`${id}-modify-options-${option.enumValue}`}
                  key={`${id}-modify-options-${option.enumValue}`}
                  value={option.enumValue}
                  label={handleLabelText({
                    text: option.label,
                    section: sectionTitle,
                  })}
                  onClick={() => {
                    setSelectedRadio(option);
                  }}
                />
              );
            })}

            {selectedRadio?.label === "Other" && (
              <>
                <OakP $font="body-3">Provide details below:</OakP>
                <TextArea
                  onChange={(e) => setUserFeedbackText(e.target.value)}
                />
              </>
            )}
          </OakRadioGroup>
        </DropDownFormWrapper>
      )}
    </OakBox>
  );
};

function handleLabelText({
  text,
  section,
}: {
  text: string;
  section: string;
}): string {
  log.info("section", section);
  if (
    section === "Misconceptions" ||
    section === "Key learning points" ||
    section === "Learning cycles" ||
    section === "Additional materials"
  ) {
    if (text.includes("it")) {
      return text.replace("it", "them");
    }
  }
  return text;
}

export default ModifyButton;
