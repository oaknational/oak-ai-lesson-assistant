import type { LessonPlanSectionWhileStreaming } from "@oakai/aila/src/protocol/schema";

import type { AilaUserModificationAction } from "@prisma/client";

import { ComponentType } from "@/lib/avo/Avo";

import ActionButtonWrapper from "./action-button-wrapper";
import { additionalMaterialsModifyOptions } from "./action-button.types";
import type { FeedbackOption } from "./drop-down-form-wrapper";

export type AdditionalMaterialsProps = Readonly<{
  sectionTitle: string;
  sectionPath: string;
  sectionValue: LessonPlanSectionWhileStreaming;
}>;

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
      trackingComponentType={ComponentType.ADD_ADDITIONAL_MATERIALS_BUTTON}
    />
  );
};

export default AddAdditionalMaterialsButton;
