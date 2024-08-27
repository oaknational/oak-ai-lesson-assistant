import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Flex } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import Button from "@/components/Button";
import { Icon } from "@/components/Icon";

import { dialogOverlay } from "./FeedbackDialog";

const dialogContent = cva([
  "bottom-0 left-0 right-0 top-0 md:bottom-[20%] md:left-[20%] md:right-[20%] md:top-[20%]",
  "data-[state=open]:animate-contentShow fixed z-50 border-2 border-black bg-twilight p-10 focus:outline-none md:p-30",
  "flex items-center justify-center",
]);

const RestoreDialog = (props: Readonly<RestoreDialogProps>) => {
  const {
    closeDialog,
    handleReset,
    restoreButtonText,
    startNewButtonText,
    bodyText,
    titleText,
  } = props;
  const [clearing, setClearing] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewSession = () => {
    handleReset();
    setClearing(true);
    const timer = setTimeout(() => {
      closeDialog();
      scrollToTop();
      setClearing(false);
    }, 1000);
    return () => clearTimeout(timer);
  };
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={dialogOverlay()} />
      <Dialog.Content className={dialogContent()}>
        <Flex direction="column" gap="7" className="gap-12">
          <p className="text-xl font-bold">{titleText}</p>
          <p>{bodyText}</p>
          {clearing ? (
            <Flex direction="row" className="flex gap-7" align="center">
              <div className="flex w-fit min-w-18">
                <Icon
                  icon="reload"
                  size="md"
                  color="black"
                  className="animate-spin"
                />
              </div>
              <p>Starting new session</p>
            </Flex>
          ) : (
            <div className="mt-12 flex gap-7">
              <Button variant="text-link" onClick={() => closeDialog()}>
                {restoreButtonText}
              </Button>
              <Button
                variant="text-link"
                onClick={() => {
                  handleNewSession();
                }}
              >
                {startNewButtonText}
              </Button>
            </div>
          )}
        </Flex>
        <Dialog.Close asChild>
          <button
            className="absolute right-10 top-10 sm:right-10 sm:top-10"
            onClick={closeDialog}
          >
            Close
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

type RestoreDialogProps = {
  closeDialog: () => void;
  handleReset: () => void;
  restoreButtonText: string;
  startNewButtonText: string;
  bodyText: string;
  titleText: string;
};

export const RestoreDialogRoot = Dialog.Root;

export default RestoreDialog;
