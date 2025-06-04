import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import {
  type OakIconName,
  OakModalCenter,
  OakModalCenterBody,
} from "@oaknational/oak-components";
import type { Message } from "ai";
import styled from "styled-components";

import type { DialogTypes } from "../AppComponents/Chat/Chat/types";
import { useDialog } from "../AppComponents/DialogContext";
import AdditionalMaterialsError from "./ContentOptions/AdditionalMaterialError";
import AdditionalMaterialsInappropriateContent from "./ContentOptions/AdditionalMaterialsInappropriateContent";
import AdditionalMaterialsModeration from "./ContentOptions/AdditionalMaterialsModeration";
import AdditionalMaterialsRateLimit from "./ContentOptions/AdditionalMaterialsRateLimit";
import AdditionalMaterialsStartAgain from "./ContentOptions/AdditionalMaterialsStartAgain";
import ClearChatHistory from "./ContentOptions/ClearChatHistory";
import ClearSingleChatFromChatHistory from "./ContentOptions/ClearSingleChatFromChatHistory";
import DemoInterstitialDialog from "./ContentOptions/DemoInterstitialDialog";
import DemoShareLockedDialog from "./ContentOptions/DemoShareLockedDialog";
import EndOfLessonFeedback from "./ContentOptions/EndOfLessonFeedback";
import ReportContentDialog from "./ContentOptions/ReportContentDialog";
import ShareChatDialog from "./ContentOptions/ShareChatDialog";

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
  "additional-materials-moderation": {
    title: "Guidance",
    iconName: "info",
  },
  "additional-materials-threat-detected": {
    title: "Inappropriate content detected",
    iconName: null,
  },
  "additional-materials-rate-limit": {
    title: "Rate limit",
    iconName: "warning",
  },
  "additional-materials-toxic-moderation": {
    title: "Inappropriate content detected",
    iconName: null,
    hideClosedButton: true,
  },
  "additional-materials-error": {
    title: "An error occurred",
    iconName: "warning",
  },
  "additional-materials-start-again": {
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
  readonly lesson: LooseLessonPlan;
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
            {dialogWindow === "additional-materials-moderation" && (
              <AdditionalMaterialsModeration closeDialog={closeDialog} />
            )}
            {dialogWindow === "additional-materials-threat-detected" && (
              <AdditionalMaterialsInappropriateContent
                body={
                  "This request has been flagged as potentially inappropriate. Please amend lesson details. If this is an error, please give us feedback below."
                }
                closeDialog={closeDialog}
              />
            )}
            {dialogWindow === "additional-materials-rate-limit" && (
              <AdditionalMaterialsRateLimit closeDialog={closeDialog} />
            )}
            {dialogWindow === "additional-materials-toxic-moderation" && (
              <AdditionalMaterialsInappropriateContent
                body={
                  "Your account will be blocked if you persist in creating inappropriate content. If this is an error, please give us feedback below."
                }
                closeDialog={closeDialog}
              />
            )}
            {dialogWindow === "additional-materials-start-again" && (
              <AdditionalMaterialsStartAgain closeDialog={closeDialog} />
            )}
            {dialogWindow === "additional-materials-error" && (
              <AdditionalMaterialsError closeDialog={closeDialog} />
            )}
          </OakModalCenterBody>
        </OakModalAtTheFront>
      )}
    </>
  );
};
export default DialogContents;
