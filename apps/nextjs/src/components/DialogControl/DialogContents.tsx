import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";

import { useDialog } from "../AppComponents/DialogContext";
import { Icon } from "../Icon";
import ChatActions from "./ContentOptions/ChatActions";
import DemoInterstitialDialog from "./ContentOptions/DemoInterstitialDialog";
import DemoShareLockedDialog from "./ContentOptions/DemoShareLockedDialog";
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
            {dialogWindow === "share-chat" && (
              <ShareChatDialog setOpenExportDialog={setDialogWindow} />
            )}
            {dialogWindow === "demo-share-locked" && (
              <DemoShareLockedDialog closeDialog={closeDialog} />
            )}
            {dialogWindow === "feedback" && (
              <ChatActions closeDialog={closeDialog} />
            )}
            {dialogWindow === "report-content" && (
              <ReportContentDialog closeDialog={closeDialog} />
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
