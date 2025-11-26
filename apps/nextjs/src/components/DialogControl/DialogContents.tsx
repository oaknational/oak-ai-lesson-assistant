import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";

import {
  type OakIconName,
  OakModalCenter,
  OakModalCenterBody,
} from "@oaknational/oak-components";
import type { Message } from "ai";
import styled from "styled-components";

import type { DialogTypes } from "../AppComponents/Chat/Chat/types";
import { useDialog } from "../AppComponents/DialogContext";
import ClearChatHistory from "./ContentOptions/ClearChatHistory";
import ClearSingleChatFromChatHistory from "./ContentOptions/ClearSingleChatFromChatHistory";
import DemoInterstitialDialog from "./ContentOptions/DemoInterstitialDialog";
import DemoShareLockedDialog from "./ContentOptions/DemoShareLockedDialog";
import EndOfLessonFeedback from "./ContentOptions/EndOfLessonFeedback";
import ReportContentDialog from "./ContentOptions/ReportContentDialog";
import ShareChatDialog from "./ContentOptions/ShareChatDialog";
import AdditionalMaterialsError from "./ContentOptions/TeachingMaterialsError";
import AdditionalMaterialsInappropriateContent from "./ContentOptions/TeachingMaterialsInappropriateContent";
import AdditionalMaterialsModeration from "./ContentOptions/TeachingMaterialsModeration";
import AdditionalMaterialsRateLimit from "./ContentOptions/TeachingMaterialsRateLimit";
import AdditionalMaterialsStartAgain from "./ContentOptions/TeachingMaterialsStartAgain";
import AdditionalMaterialsThreatDetected from "./ContentOptions/TeachingMaterialsThreatDetected";
import AdditionalMaterialsUserFeedback from "./ContentOptions/TeachingMaterialsUserFeedback";

const dialogTitlesAndIcons: Record<
  Exclude<DialogTypes, "">,
  { title: string; iconName: OakIconName | null; hideClosedButton?: boolean }
> = {
  "share-chat": {
    title: "Share lesson",
    iconName: null,
  },
  feedback: {
    title: "",
    iconName: null,
  },
  "report-content": {
    title: "Report content",
    iconName: "warning",
  },
  "sensitive-moderation-user-comment": {
    title: "Sensitive moderation user comment",
    iconName: "warning",
  },
  "demo-interstitial": {
    title: "Demo lesson limits",
    iconName: "warning",
  },
  "demo-share-locked": {
    title: "Sharing and downloading",
    iconName: "warning",
  },
  "clear-history": {
    title: "Are you absolutely sure?",
    iconName: null,
  },
  "clear-single-chat": {
    title: "Are you absolutely sure?",
    iconName: null,
  },
  "teaching-materials-moderation": {
    title: "",
    iconName: null,
  },
  "teaching-materials-threat-detected": {
    title: "",
    iconName: null,
  },
  "teaching-materials-rate-limit": {
    title: "",
    iconName: null,
  },
  "teaching-materials-toxic-moderation": {
    title: "",
    iconName: null,
    hideClosedButton: true,
  },
  "teaching-materials-error": {
    title: "An error occurred",
    iconName: "warning",
    hideClosedButton: true,
  },
  "teaching-materials-start-again": {
    title: "",
    iconName: null,
  },
  "teaching-materials-user-feedback": {
    title: "",
    iconName: null,
  },
};

const OakModalAtTheFront = styled(OakModalCenter)`
  z-index: 100000;
`;

const DialogContents = ({
  chatId,
  lesson,
  children,
  messages,
  submit,
  isShared,
}: {
  readonly chatId: string | undefined;
  readonly lesson: PartialLessonPlan;
  readonly children?: React.ReactNode;
  readonly messages?: Message[];
  readonly submit?: () => void;
  readonly isShared?: boolean;
}) => {
  const { dialogWindow, setDialogWindow, setDialogProps, openSidebar } =
    useDialog();
  const closeDialog = () => {
    setDialogWindow("");
    setDialogProps({});
  };

  if (dialogWindow === "" && !openSidebar) return null;

  return (
    <>
      {dialogWindow !== "" && (
        <OakModalAtTheFront
          hideCloseButton={
            dialogTitlesAndIcons[dialogWindow].hideClosedButton ?? false
          }
          isOpen={!!dialogWindow}
          onClose={closeDialog}
        >
          <OakModalCenterBody
            title={dialogTitlesAndIcons[dialogWindow].title}
            iconName={dialogTitlesAndIcons[dialogWindow].iconName ?? "warning"}
            hideIcon={dialogTitlesAndIcons[dialogWindow].iconName === null}
          >
            {children}
            {dialogWindow === "share-chat" && chatId && (
              <ShareChatDialog
                lesson={lesson}
                chatId={chatId}
                setOpenExportDialog={setDialogWindow}
                isShared={isShared}
              />
            )}
            {dialogWindow === "report-content" && (
              <ReportContentDialog
                chatId={chatId}
                closeDialog={closeDialog}
                messages={messages}
              />
            )}
            {dialogWindow === "demo-share-locked" && (
              <DemoShareLockedDialog closeDialog={closeDialog} />
            )}
            {dialogWindow === "demo-interstitial" && (
              <DemoInterstitialDialog
                submit={submit}
                closeDialog={closeDialog}
              />
            )}
            {dialogWindow === "feedback" && (
              <EndOfLessonFeedback closeDialog={closeDialog} />
            )}
            {dialogWindow === "clear-history" && (
              <ClearChatHistory closeDialog={closeDialog} />
            )}
            {dialogWindow === "clear-single-chat" && (
              <ClearSingleChatFromChatHistory closeDialog={closeDialog} />
            )}
            {dialogWindow === "teaching-materials-moderation" && (
              <AdditionalMaterialsModeration closeDialog={closeDialog} />
            )}
            {dialogWindow === "teaching-materials-threat-detected" && (
              <AdditionalMaterialsThreatDetected closeDialog={closeDialog} />
            )}
            {dialogWindow === "teaching-materials-rate-limit" && (
              <AdditionalMaterialsRateLimit closeDialog={closeDialog} />
            )}
            {dialogWindow === "teaching-materials-toxic-moderation" && (
              <AdditionalMaterialsInappropriateContent
                closeDialog={closeDialog}
              />
            )}
            {dialogWindow === "teaching-materials-start-again" && (
              <AdditionalMaterialsStartAgain closeDialog={closeDialog} />
            )}
            {dialogWindow === "teaching-materials-error" && (
              <AdditionalMaterialsError closeDialog={closeDialog} />
            )}
            {dialogWindow === "teaching-materials-user-feedback" && (
              <AdditionalMaterialsUserFeedback closeDialog={closeDialog} />
            )}
          </OakModalCenterBody>
        </OakModalAtTheFront>
      )}
    </>
  );
};
export default DialogContents;
