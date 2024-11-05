import type { KeyStageName, SubjectName } from "@oakai/core";
import { Flex, Heading, Text } from "@radix-ui/themes";

type ConfirmedProps = {
  subject?: SubjectName | string;
  keyStage?: KeyStageName | "";
  topic?: string;
};
export default function Confirmed({
  subject,
  keyStage,
  topic,
}: Readonly<ConfirmedProps>) {
  return (
    <Flex direction="column">
      <Text mb="3">Designing a quiz for:</Text>
      <Heading size="7" mb="3">
        {subject ?? "No subject selected"}
      </Heading>
      <Heading size="5" mb="3">
        {keyStage ?? "No key stage selected"} {topic && "-"} {topic}
      </Heading>
    </Flex>
  );
}
