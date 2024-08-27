import * as Tooltip from "@radix-ui/react-tooltip";
import { Box, Text } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import Button from "../../Button";

const promptExplainerButtonVariants = cva(
  "left-0 top-[-120px] z-10 flex w-44 flex-col bg-lemon30 p-10 opacity-100 delay-75 duration-150",
);

type PromptExplainerButtonProps = {
  id: string;
  description: string;
};

const PromptExplainerButton = ({
  id,
  description,
}: Readonly<PromptExplainerButtonProps>) => {
  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={1000}>
      <Tooltip.Root>
        <Box position="relative">
          <Tooltip.Trigger asChild>
            <Box className="hidden scale-[0.8] sm:block">
              <Button
                variant="icon-only"
                icon="question-mark-white"
                size="sm"
                href={`/prompts/#${id}`}
                target="_blank"
              />
            </Box>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={6000}>
              <Box
                position="absolute"
                className={promptExplainerButtonVariants()}
              >
                <span className="absolute bottom-[-4px] left-[-5px] h-0 w-0 rotate-[-90deg] border-l-[12px] border-r-[12px] border-t-[15px] border-l-transparent border-r-transparent border-t-lemon30"></span>
                <Text className="text-sm">
                  {description} {"   "}
                </Text>

                <Text className="text-sm">
                  Click to see the prompts that we use.
                </Text>
              </Box>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Box>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default PromptExplainerButton;
