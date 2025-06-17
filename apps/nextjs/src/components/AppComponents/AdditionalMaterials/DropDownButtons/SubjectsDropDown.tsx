import { subjectNameMap } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import { SharedDropDown } from "./SharedDropDown";

interface SubjectsDropDownProps {
  selectedSubject: string | null;
  setSelectedSubject: (value: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null) => void;
}

const subjectOptions = [
  ...Object.values(subjectNameMap)
    .filter((subject): subject is string => subject !== undefined)
    .sort((a, b) => a.localeCompare(b)),
  "Other",
];
export const SubjectsDropDown = ({
  selectedSubject,
  setSelectedSubject,
  activeDropdown,
  setActiveDropdown,
}: SubjectsDropDownProps) => {
  return (
    <SharedDropDown
      selectedValue={selectedSubject}
      setSelectedValue={setSelectedSubject}
      activeDropdown={activeDropdown}
      setActiveDropdown={setActiveDropdown}
      options={subjectOptions}
      dropdownType="subjects"
      placeholder="Subject"
      customPlaceholder="Enter your custom subject"
    />
  );
};
