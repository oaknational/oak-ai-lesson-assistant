import type { AilaUserModificationAction } from "@prisma/client";

import ActionButtonWrapper from "./action-button-wrapper";
import { additionalMaterialsModifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type AdditionalMaterialsProps = {
  sectionTitle: string;
  sectionPath: string;
  sectionValue: Record<string, unknown> | string | Array<unknown>;
};

const AddAdditionalMaterialsButton = ({
  sectionTitle,
  sectionPath,
  sectionValue,
}: AdditionalMaterialsProps) => {
  const generateMessage = (
    option: FeedbackOption<AilaUserModificationAction>,
    userFeedbackText: string,
  ) =>
    option.label === "Other"
      ? `For the ${sectionTitle}, ${userFeedbackText}`
      : `${option.chatMessage} to the additional materials section`;

  return (
    <ActionButtonWrapper
      sectionTitle={`Ask Aila to add:`}
      sectionPath={sectionPath}
      sectionValue={sectionValue}
      options={additionalMaterialsModifyOptions}
      actionButtonLabel="Add additional materials"
      tooltip="Aila can help add additional materials"
      userSuggestionTitle="What additional materials would you like to add?"
      generateMessage={generateMessage}
      buttonText={"Add materials"}
    />
  );
};

export default AddAdditionalMaterialsButton;
