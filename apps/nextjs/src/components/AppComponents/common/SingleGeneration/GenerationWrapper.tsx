import { useCallback, useState } from "react";

import type { GenerationPart } from "@oakai/core/src/types";

import { Box } from "@radix-ui/themes";

import GenerationFeedbackDialog, {
  FeedbackDialogRoot,
} from "./GenerationFeedbackDialog";

type GenerationWrapperProps = {
  children: React.ReactNode;
  generatedItem: GenerationPart<unknown> | null;
  sessionId: string;
};
const GenerationWrapper = ({
  children,
  generatedItem,
  sessionId,
}: Readonly<GenerationWrapperProps>) => {
  const [feedbackDialogIsOpen, setFeedbackDialogIsOpen] = useState(false);
  const closeFeedbackDialog = useCallback(() => {
    setFeedbackDialogIsOpen(false);
  }, []);
  return (
    <FeedbackDialogRoot
      open={feedbackDialogIsOpen}
      onOpenChange={setFeedbackDialogIsOpen}
    >
      <Box pb="5" className="w-full border-b border-black border-opacity-10">
        <GenerationFeedbackDialog
          closeDialog={closeFeedbackDialog}
          flaggedItem={generatedItem}
          sessionId={sessionId}
        />
        {children}
      </Box>
    </FeedbackDialogRoot>
  );
};

export default GenerationWrapper;
