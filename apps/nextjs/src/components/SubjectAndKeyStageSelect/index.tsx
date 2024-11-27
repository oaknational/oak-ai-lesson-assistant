import { useEffect, useMemo } from "react";

import type {
  KeyStageName,
  SubjectName,
} from "@oakai/core/src/data/subjectsAndKeyStages";
import { subjectsAndKeyStages } from "@oakai/core/src/data/subjectsAndKeyStages";
import { Flex } from "@radix-ui/themes";

import Input from "../Input";

const keyStages = ["", ...subjectsAndKeyStages.allStages];

type SubjectAndKeyStageSelectProps = {
  keyStage: KeyStageName | "";
  setSelectedKeyStage: (keyStage: KeyStageName) => void;
  selectedSubject?: SubjectName | "";
  setSelectedSubject: (keyStage: SubjectName) => void;
  direction?: "row" | "column";
};

export const SubjectAndKeyStageSelect = ({
  keyStage,
  selectedSubject,
  setSelectedKeyStage,
  setSelectedSubject,
  direction,
}: Readonly<SubjectAndKeyStageSelectProps>) => {
  const allowedSubjects = useMemo(() => {
    if (keyStage !== "") {
      return subjectsAndKeyStages.byKeyStage[keyStage].subjects;
    }
    return [""];
  }, [keyStage]);

  /**
   * When the user modifies the key stage, check
   * if the subject they currently have selected is allowed
   * as an option.
   * If not, or if they haven't set a subject reset the
   * subject to be the first available
   */
  useEffect(() => {
    const havePickedUnavailableSubject =
      selectedSubject && !allowedSubjects.includes(selectedSubject);
    if (havePickedUnavailableSubject ?? !selectedSubject) {
      const firstAvailableSubject = allowedSubjects[0];

      if (selectedSubject !== firstAvailableSubject) {
        setSelectedSubject(firstAvailableSubject as SubjectName);
      }
    }
  }, [keyStage, selectedSubject, setSelectedSubject, allowedSubjects]);
  return (
    <Flex direction={direction} gap="4">
      <div className="w-full">
        <KeyStageSelect
          keyStage={keyStage}
          setSelectedKeyStage={setSelectedKeyStage}
        />
      </div>
      <div className="w-full">
        <SubjectSelect
          keyStage={keyStage}
          setSelectedSubject={setSelectedSubject}
          selectedSubject={selectedSubject}
        />
      </div>
    </Flex>
  );
};

type KeyStageSelectProps = {
  keyStage: KeyStageName | "";
  setSelectedKeyStage: (k: KeyStageName) => void;
};

const KeyStageSelect = ({
  keyStage,
  setSelectedKeyStage,
}: Readonly<KeyStageSelectProps>) => {
  return (
    <Input
      type="dropdown"
      label="Key Stage"
      name="keyStage"
      options={keyStages}
      onChange={(e) => setSelectedKeyStage(e.target.value as KeyStageName)}
      value={keyStage}
    />
  );
};

type SubjectSelectProps = {
  keyStage: KeyStageName | "";
  selectedSubject?: SubjectName | "";
  setSelectedSubject: (subjectName: SubjectName) => void;
};

const SubjectSelect = ({
  keyStage,
  setSelectedSubject,
  selectedSubject,
}: Readonly<SubjectSelectProps>) => {
  const allowedSubjects = useMemo(() => {
    if (keyStage !== "") {
      return subjectsAndKeyStages.byKeyStage[keyStage].subjects;
    }
    return [""];
  }, [keyStage]);

  return (
    <Input
      type="dropdown"
      label="Subject"
      name="subject"
      options={allowedSubjects}
      onChange={(e) => setSelectedSubject(e.target.value as SubjectName)}
      value={selectedSubject}
    />
  );
};
