import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import {
  OakModalCenter,
  OakModalCenterBody,
  type OakIconName,
} from "@oaknational/oak-components";
import type { Message } from "ai";

import type { DialogTypes } from "../AppComponents/Chat/Chat/types";
import { useDialog } from "../AppComponents/DialogContext";
import ClearChatHistory from "./ContentOptions/ClearChatHistory";
import ClearSingleChatFromChatHistory from "./ContentOptions/ClearSingleChatFromChatHistory";
import DemoInterstitialDialog from "./ContentOptions/DemoInterstitialDialog";
import DemoShareLockedDialog from "./ContentOptions/DemoShareLockedDialog";
import EndOfLessonFeedback from "./ContentOptions/EndOfLessonFeedback";
import ReportContentDialog from "./ContentOptions/ReportContentDialog";
import ShareChatDialog from "./ContentOptions/ShareChatDialog";

const dialogTitlesAndIcons: Record<
  Exclude<DialogTypes, "">,
  { title: string; iconName: OakIconName | null }
> = {
  "share-chat": {
    title: "Share lesson",
    iconName: "share",
  },
  feedback: {
    title: "",
    iconName: "books",
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
    title: "Lesson limit reached",
    iconName: "warning",
  },
  "demo-share-locked": {
    title: "Sharing and downloading",
    iconName: "warning",
  },
  "clear-history": {
    title: "Clear chat history",
    iconName: null,
  },
  "clear-single-chat": {
    title: "Clear chat",
    iconName: null,
  },
};

const DialogContents = ({
  chatId,
  lesson,
  children,
  messages,
  submit,
  isShared,
}: {
  chatId: string | undefined;
  lesson: LooseLessonPlan;
  children?: React.ReactNode;
  messages?: Message[];
  submit?: () => void;
  isShared?: boolean | undefined;
}) => {
  const { dialogWindow, setDialogWindow, setDialogProps } = useDialog();
  const closeDialog = () => {
    setDialogWindow("");
    setDialogProps({});
  };

  if (dialogWindow === "") return null;
  return (
    <OakModalCenter isOpen={!!dialogWindow} onClose={closeDialog}>
      <OakModalCenterBody
        title={dialogTitlesAndIcons[dialogWindow].title}
        iconName={dialogTitlesAndIcons[dialogWindow].iconName || "warning"}
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
          <DemoInterstitialDialog submit={submit} closeDialog={closeDialog} />
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
      </OakModalCenterBody>
    </OakModalCenter>
  );
};
export default DialogContents;
