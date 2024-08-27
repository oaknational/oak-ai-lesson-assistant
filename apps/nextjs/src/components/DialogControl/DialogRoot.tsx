import { useEffect } from "react";

import { useAuth } from "@clerk/nextjs";
import * as Dialog from "@radix-ui/react-dialog";

import { useDialog } from "../AppComponents/DialogContext";

const DialogRoot = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  const { dialogWindow, setDialogWindow } = useDialog();

  useEffect(() => {
    if (!isSignedIn) {
      setDialogWindow("");
    }
  }, [isSignedIn, setDialogWindow]);

  return <Dialog.Root open={!!dialogWindow}>{children}</Dialog.Root>;
};

export { DialogRoot };
