import { Box, Flex, Heading, Text } from "@radix-ui/themes";

import Button from "@/components/Button";

type JudgementHeadingProps = {
  title: string;
  skipQuestion: () => void;
  judgementId?: string;
  lessonDescription: string;
};

const JudgementHeading = ({
  title,
  skipQuestion,
  judgementId,
  lessonDescription,
}: Readonly<JudgementHeadingProps>) => {
  return (
    <Flex
      mt="6"
      mb="7"
      direction="row"
      justify="between"
      align="start"
      className="border-b border-opacity-40 pb-20"
    >
      <Box className="max-w-[600px]">
        <Heading size="3" mb="2" weight="light">
          Lesson Title:
        </Heading>
        <Heading mb="4">{title}</Heading>
        <Text>{lessonDescription}</Text>
      </Box>
      <Flex gap="6">
        <Button
          variant="text-link"
          icon="external"
          target="_blank"
          href={`/comparative-judgement/preview/${judgementId}`}
          disabled={judgementId === undefined}
        >
          Share comparison
        </Button>
        <Button
          variant="text-link"
          icon="arrow-right"
          onClick={() => {
            skipQuestion();
          }}
        >
          Skip
        </Button>
      </Flex>
    </Flex>
  );
};

export default JudgementHeading;
