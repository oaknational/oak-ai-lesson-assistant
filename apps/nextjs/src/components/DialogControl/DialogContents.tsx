import { useCallback, type Dispatch, type SetStateAction } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";

import type { DialogTypes } from "../AppComponents/Chat/Chat/types";
import { useDialog } from "../AppComponents/DialogContext";
import {
  useChatLessonPlan,
  useChatMessages,
} from "../ContextProviders/ChatProvider";
import { Icon } from "../Icon";
import DemoInterstitialDialog from "./ContentOptions/DemoInterstitialDialog";
import DemoShareLockedDialog from "./ContentOptions/DemoShareLockedDialog";
import EndOfLessonFeedback from "./ContentOptions/EndOfLessonFeedback";
import ReportContentDialog from "./ContentOptions/ReportContentDialog";
import ShareChatDialog from "./ContentOptions/ShareChatDialog";
import {
  dialogContent,
  dialogContentInner,
  dialogOverlay,
} from "./dialogStyles";

const DialogContents = ({
  children,
  submit,
}: {
  children?: React.ReactNode;
  submit?: () => void;
}) => {
  const { dialogWindow, setDialogWindow } = useDialog();
  const closeDialog = useCallback(() => setDialogWindow(""), [setDialogWindow]);

  return (
    <Dialog.Portal>
      <Box className={dialogOverlay()}>
        <Dialog.Overlay
          className="absolute inset-0 cursor-pointer"
          onClick={closeDialog}
        />
        <Dialog.Content className={dialogContent()}>
          <DialogContentInner
            closeDialog={closeDialog}
            dialogWindow={dialogWindow}
            setDialogWindow={setDialogWindow}
            submit={submit}
          >
            {children}
          </DialogContentInner>
        </Dialog.Content>
      </Box>
    </Dialog.Portal>
  );
};
export default DialogContents;

const DialogContentInner = ({
  children,
  closeDialog,
  dialogWindow,
  setDialogWindow,
  submit,
}: {
  children?: React.ReactNode;
  closeDialog: () => void;
  dialogWindow: DialogTypes;
  setDialogWindow: Dispatch<SetStateAction<DialogTypes>>;
  submit?: () => void;
}) => {
  const { messages } = useChatMessages();
  const { id: chatId, chat, lessonPlan: lesson } = useChatLessonPlan();
  const isShared = chat?.isShared || false;

  return (
    <Box className={dialogContentInner()}>
      <Flex justify="end" width="100%" className="relative z-10 ">
        <button onClick={closeDialog}>
          <Icon icon="cross" size="sm" />
        </button>
      </Flex>
      {children}
      {dialogWindow === "share-chat" && chatId && (
        <ShareChatDialog
          lesson={lesson}
          chatId={chatId}
          setOpenExportDialog={setDialogWindow}
          isShared={isShared}
        />
      )}
      {dialogWindow === "demo-share-locked" && (
        <DemoShareLockedDialog closeDialog={closeDialog} />
      )}
      {dialogWindow === "feedback" && (
        <EndOfLessonFeedback closeDialog={closeDialog} />
      )}
      {dialogWindow === "report-content" && (
        <ReportContentDialog
          chatId={chatId}
          closeDialog={closeDialog}
          messages={messages}
        />
      )}
      {dialogWindow === "demo-interstitial" && (
        <DemoInterstitialDialog submit={submit} closeDialog={closeDialog} />
      )}
    </Box>
  );
};
