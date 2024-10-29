import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";
import type { Message } from "ai";

import { useDialog } from "../AppComponents/DialogContext";
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

  return (
    <Dialog.Portal>
      <Box className={dialogOverlay()}>
        <Dialog.Overlay
          className="absolute inset-0 cursor-pointer"
          onClick={closeDialog}
        />
        <Dialog.Content className={dialogContent()}>
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
              <DemoInterstitialDialog
                submit={submit}
                closeDialog={closeDialog}
              />
            )}
          </Box>
        </Dialog.Content>
      </Box>
    </Dialog.Portal>
  );
};
export default DialogContents;
