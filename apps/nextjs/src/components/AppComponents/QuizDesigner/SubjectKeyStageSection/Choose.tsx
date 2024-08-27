import { useEffect, useState } from "react";

import {
  KeyStageName,
  SubjectName,
} from "@oakai/core/src/data/subjectsAndKeyStages";
import { Box, Flex } from "@radix-ui/themes";
import { useDebounce } from "usehooks-ts";

import { SubjectAndKeyStageSelect } from "@/components/SubjectAndKeyStageSelect";

import Input from "../../../Input";

interface ChooseProps {
  keyStage: KeyStageName | "";
  setSelectedKeyStage: (keyStage: KeyStageName) => void;
  selectedSubject?: SubjectName | "";
  setSelectedSubject: (subjectName: SubjectName) => void;
  topic?: string;
  setTopic: (topic: string) => void;
  direction?: "row" | "column";
}

export default function Choose({
  setSelectedSubject,
  setSelectedKeyStage,
  setTopic,
  selectedSubject,
  keyStage,
  direction,
  topic,
}: Readonly<ChooseProps>) {
  const [tempTopic, setTempTopic] = useState(topic ?? "");
  const debouncedTopic = useDebounce(tempTopic, 250);
  useEffect(() => {
    setTopic(debouncedTopic);
  }, [debouncedTopic, setTopic]);
  return (
    // TODO reintroduce form submission
    // <form
    //   onSubmit={(e) => {
    //     e.preventDefault();
    //     setTopic(tempTopic);
    //   }}
    // >
    <Flex gap="0" direction="column" mt="9" className="w-full">
      <p className="font-bold">
        Choose your subject and key stage to get started.
      </p>

      <SubjectAndKeyStageSelect
        keyStage={keyStage}
        setSelectedKeyStage={setSelectedKeyStage}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        direction={direction}
      />

      <Box>
        <p>
          <span className="font-bold">Set a topic</span>. The name of the
          overall topic in which the lesson sits. Eg. Ancient Rome
        </p>
        <Input
          type="text"
          label="Topic"
          name="topic"
          value={tempTopic}
          onChange={(e) => setTempTopic(e.target.value)}
        />
      </Box>
    </Flex>
    // </form>
  );
}
