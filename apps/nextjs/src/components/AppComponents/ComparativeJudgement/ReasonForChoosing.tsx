import { Box, Flex } from "@radix-ui/themes";

import Button from "@/components/Button";
import Input from "@/components/Input";

type ReasonForChoosingProps = {
  setReasonForChoice: (reason: string) => void;
  clearReasonForChoice: () => void;
  chooseQuestion: () => void;
  focus: boolean;
};

const ReasonForChoosing = ({
  setReasonForChoice,
  clearReasonForChoice,
  chooseQuestion,
  focus,
}: Readonly<ReasonForChoosingProps>) => {
  return (
    <Box>
      <Box className={focus ? "shadow-lg" : ""}>
        <Input
          label="Reason for choice"
          name="Reasoning"
          type="textarea"
          onBlur={(e) => setReasonForChoice(e.target.value)}
          className="mb-16"
          resize={false}
        />
      </Box>
      <Flex gap="6">
        <Button variant="primary" onClick={() => chooseQuestion()}>
          Submit
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            clearReasonForChoice();
            chooseQuestion();
          }}
        >
          Skip reasoning
        </Button>
      </Flex>
    </Box>
  );
};

export default ReasonForChoosing;
