import { useEffect } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import {
  OakModalCenter,
  OakModalCenterBody,
  type OakIconName,
} from "@oaknational/oak-components";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";
import type { Message } from "ai";

import { useDialog } from "../AppComponents/DialogContext";
import DemoInterstitialDialog from "./ContentOptions/DemoInterstitialDialog";
import DemoShareLockedDialog from "./ContentOptions/DemoShareLockedDialog";
import EndOfLessonFeedback from "./ContentOptions/EndOfLessonFeedback";
import ReportContentDialog from "./ContentOptions/ReportContentDialog";
import ShareChatDialog from "./ContentOptions/ShareChatDialog";

const dialogTitlesAndIcons: {
  [key: string]: { title: string; iconName: OakIconName };
} = {
  "share-chat": {
    title: "Share chat",
    iconName: "share",
  },
  feedback: {
    title: "Before you",
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
  const { dialogWindow, setDialogWindow } = useDialog();
  const closeDialog = () => setDialogWindow("");

  if (
    !dialogTitlesAndIcons[dialogWindow]?.title ||
    !dialogTitlesAndIcons[dialogWindow]?.iconName
  ) {
    return null;
  }
  return (
    <OakModalCenter isOpen={!!dialogWindow} onClose={closeDialog}>
      <OakModalCenterBody
        title={dialogTitlesAndIcons[dialogWindow].title}
        iconName={dialogTitlesAndIcons[dialogWindow].iconName}
        hideIcon={dialogWindow === "feedback"}
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
      </OakModalCenterBody>
    </OakModalCenter>
  );
};
export default DialogContents;
