import type { AilaUserModificationAction } from "@prisma/client";

<<<<<<< HEAD
import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";
import type { AilaUserModificationAction } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { OakBox, OakP, OakRadioGroup } from "@oaknational/oak-components";
import { TextArea } from "@radix-ui/themes";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { trpc } from "@/utils/trpc";

import ActionButton from "./action-button";
=======
import ActionButtonWrapper from "./action-button-wrapper";
import { modifyOptions } from "./action-button.types";
>>>>>>> origin/main
import type { FeedbackOption } from "./drop-down-form-wrapper";

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
<<<<<<< HEAD
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userFeedbackText, setUserFeedbackText] = useState("");
  const [selectedRadio, setSelectedRadio] =
    useState<FeedbackOption<AilaUserModificationAction> | null>(null);

  const chat = useLessonChat();
  const { append } = chat;

  const { id, messages } = chat;

  const { mutateAsync } = trpc.chat.chatFeedback.modifySection.useMutation();

  const lastAssistantMessage = getLastAssistantMessage(messages);

  // Type guard to check if the value is a plain object
  const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  };

  const prepareSectionValue = (
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
  };
  const recordUserModifySectionContent = async () => {
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
  };

  async function modifySection(
=======
  const generateMessage = (
>>>>>>> origin/main
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) =>
    option.label === "Other"
      ? `For the ${sectionTitle.toLowerCase()}, ${userFeedbackText}`
      : `Make the ${sectionTitle.toLowerCase()} ${option.chatMessage?.toLowerCase()}`;

  return (
    <ActionButtonWrapper
      sectionTitle={`Ask Aila to modify ${sectionTitle.toLowerCase()}:`}
      sectionPath={sectionPath}
      sectionValue={sectionValue}
      options={modifyOptions}
      actionButtonLabel="Modify"
      tooltip="Aila can help improve this section"
      userSuggestionTitle="Provide modification options:"
      buttonText="Modify section"
      generateMessage={generateMessage}
    />
  );
};

export default ModifyButton;
