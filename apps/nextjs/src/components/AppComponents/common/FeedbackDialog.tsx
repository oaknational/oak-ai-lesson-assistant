import * as RadixDialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Input from "@/components/Input";

type FeedbackDialogProps = {
  hasSubmitted: boolean;
  closeDialog: () => void;
  setTypedFeedback: (value: string) => void;
  setContentIsInappropriate: (value: boolean) => void;
  setContentIsFactuallyIncorrect: (value: boolean) => void;
  setContentIsNotHelpful: (value: boolean) => void;
  sendFeedback: () => void;
  setHasSubmitted: (value: boolean) => void;
};

export const dialogContent = cva([
  "fixed bottom-0 left-0 right-0 top-0",
  "border-2 border-black",
  "md:bottom-[20%] md:left-[20%] md:right-[20%] md:top-[20%]",
  "flex items-center justify-center",
  "data-[state=open]:animate-contentShow z-50 bg-twilight p-10 focus:outline-none md:p-30",
]);

export const dialogOverlay = cva([
  "flex items-center justify-center",
  "cursor-pointer",
  "bg-white bg-opacity-80 duration-300 hover:bg-opacity-50",
  "fixed inset-0 z-40",
]);

const FeedbackDialog = ({
  hasSubmitted,
  closeDialog,
  setTypedFeedback,
  setContentIsInappropriate,
  setContentIsFactuallyIncorrect,
  setContentIsNotHelpful,
  sendFeedback,
  setHasSubmitted,
}: Readonly<FeedbackDialogProps>) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={dialogOverlay()} />

      <RadixDialog.Content className={dialogContent()}>
        {hasSubmitted ? (
          <Flex direction="column" className="w-full">
            <h2 className="mb-20 text-xl">
              Thank you for submitting feedback!
            </h2>
            <p>Every bit of feedback helps towards improving our tools.</p>

            <Box className="mt-14">
              <Button
                variant="primary"
                onClick={() => {
                  closeDialog();
                  setHasSubmitted(false);
                }}
              >
                Close window
              </Button>
            </Box>
          </Flex>
        ) : (
          <Flex direction="column" className="w-full">
            <h2 className="mb-20 text-xl">Provide additional feedback</h2>
            <Input
              label="Flagged feedback"
              name="flaggedFeedback"
              type="textarea"
              onChange={(e) => setTypedFeedback(e.target.value)}
              className="mb-16"
            />
            <Flex direction="column" className="mb-8">
              <CheckBox
                label="Inappropriate Content"
                setValue={setContentIsInappropriate}
              />
              <CheckBox
                label="Factually Incorrect"
                setValue={setContentIsFactuallyIncorrect}
              />
              <CheckBox label="Not Helpful" setValue={setContentIsNotHelpful} />
            </Flex>
            <Box mt="5">
              <Button variant="primary" onClick={() => sendFeedback()}>
                Submit
              </Button>
            </Box>
          </Flex>
        )}

        <RadixDialog.Close asChild>
          <button
            className="absolute right-10 top-10 sm:right-10 sm:top-10"
            onClick={() => {
              closeDialog();
              setHasSubmitted(false);
            }}
          >
            Close
          </button>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};

export default FeedbackDialog;
