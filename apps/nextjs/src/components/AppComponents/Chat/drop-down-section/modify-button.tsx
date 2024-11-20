import type { AilaUserModificationAction } from "@prisma/client";

import ActionButtonWrapper from "./action-button-wrapper";
import { modifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

type ModifyButtonProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: Record<string, unknown> | string | Array<unknown>;
};

const ModifyButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: ModifyButtonProps) => {
  const generateMessage = (
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
