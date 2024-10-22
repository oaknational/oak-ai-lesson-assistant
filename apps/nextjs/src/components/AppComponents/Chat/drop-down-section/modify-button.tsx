import { AilaUserModificationAction } from "@prisma/client";

import ActionButtonWrapper from "./action-button-wrapper";
import { modifyOptions } from "./action-button.types";
import { FeedbackOption } from "./drop-down-form-wrapper";

const ModifyButton = ({ sectionTitle, sectionPath, sectionValue }) => {
  const generateMessage = (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) =>
    option.label === "Other"
      ? `For the ${sectionTitle}, ${userFeedbackText}`
      : `Make the ${sectionTitle} ${option.chatMessage?.toLowerCase()}`;

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
