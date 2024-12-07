import { useEffect, useMemo } from "react";

import type {
  KeyStageName,
  SubjectName,
} from "@oakai/core/src/data/subjectsAndKeyStages";
import { subjectsAndKeyStages } from "@oakai/core/src/data/subjectsAndKeyStages";
import { Flex } from "@radix-ui/themes";

import Input from "@/components/Input";

const keyStages = ["", ...subjectsAndKeyStages.allStages];

type KeyStageAndSubjectPickerProps = {
  keyStage: KeyStageName | "";
  selectedSubject?: SubjectName | "";
  setSelectedSubject: (subjectName: SubjectName) => void;
  setSelectedKeyStage: (keyStage: KeyStageName) => void;
  keyStageAndSubjectToFilterBy?: typeof subjectsAndKeyStages;
};

const KeyStageAndSubjectPicker = ({
  keyStage,
  selectedSubject,
  setSelectedSubject,
  setSelectedKeyStage,
  keyStageAndSubjectToFilterBy,
}: Readonly<KeyStageAndSubjectPickerProps>) => {
  const allowedSubjects = useMemo(() => {
    if (keyStage !== "") {
      if (keyStageAndSubjectToFilterBy) {
        return keyStageAndSubjectToFilterBy.byKeyStage[keyStage].subjects;
      }
      return subjectsAndKeyStages.byKeyStage[keyStage].subjects;
    }
    return [""];
  }, [keyStage, keyStageAndSubjectToFilterBy]);

  const filteredKeyStages = useMemo(() => {
    if (keyStageAndSubjectToFilterBy) {
      return ["", ...keyStageAndSubjectToFilterBy.allStages];
    }
    return keyStages;
  }, [keyStageAndSubjectToFilterBy]);

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
    <Flex direction="column" gap="4">
      <div className="w-full">
        <Input
          type="dropdown"
          label="Key Stage"
          name="keyStage"
          options={filteredKeyStages}
          onChange={(e) => setSelectedKeyStage(e.target.value as KeyStageName)}
          value={keyStage}
        />
      </div>
      <div className="w-full">
        <Input
          type="dropdown"
          label="Subject"
          name="subject"
          options={allowedSubjects}
          onChange={(e) => setSelectedSubject(e.target.value as SubjectName)}
          value={selectedSubject}
        />
      </div>
    </Flex>
  );
};

export default KeyStageAndSubjectPicker;
