import { Box, Flex } from "@radix-ui/themes";

import { IconName } from "../../Icon";
import ChatButton from "../Chat/ui/chat-button";
import Generating from "../common/Generating";
import PromptExplainerButton from "../common/PromptExplainerButton";

type GenerateProps = {
  isLoading: boolean;
  promptID: string;
  promptDescription: string;
  onClick?: () => void;
  buttonText: string;
  icon: IconName;
  disabled?: boolean;
  estimatedDurationMs?: number;
  showTime?: boolean;
};

const GenerateButton = ({
  isLoading,
  promptID,
  promptDescription,
  onClick,
  buttonText,
  icon,
  disabled,
  estimatedDurationMs,
  showTime,
}: Readonly<GenerateProps>) => {
  if (isLoading) {
    return (
      <Flex direction="row" gap="4">
        <Generating
          estimatedDurationMs={estimatedDurationMs}
          showTime={showTime}
        />
      </Flex>
    );
  }
  return (
    <Flex direction={{ initial: "column", sm: "row" }} gap="4">
      <ChatButton
        variant="text-link"
        icon={icon}
        onClick={onClick}
        disabled={disabled}
        type="submit"
      >
        {buttonText}
      </ChatButton>
      <Box className="w-fit">
        <PromptExplainerButton id={promptID} description={promptDescription} />
      </Box>
    </Flex>
  );
};

export default GenerateButton;
