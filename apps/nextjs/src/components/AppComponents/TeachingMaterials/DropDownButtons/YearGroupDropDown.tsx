import { yearNameMap } from "@oakai/teaching-materials/src/documents/teachingMaterials/resourceTypes";

import { SharedDropDown } from "./SharedDropDown";

interface YearGroupDropDownProps {
  selectedYear: string | null;
  setSelectedYear: (value: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null) => void;
}

const yearOptions = [
  ...Object.values(yearNameMap).filter(
    (year): year is string => year !== undefined,
  ),
];
export const YearGroupDropDown = ({
  selectedYear,
  setSelectedYear,
  activeDropdown,
  setActiveDropdown,
}: YearGroupDropDownProps) => {
  return (
    <SharedDropDown
      selectedValue={selectedYear}
      setSelectedValue={setSelectedYear}
      activeDropdown={activeDropdown}
      setActiveDropdown={setActiveDropdown}
      options={yearOptions}
      dropdownType="years"
      placeholder="Year group"
      customPlaceholder="Enter custom year group"
    />
  );
};
