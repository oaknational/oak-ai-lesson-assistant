import { yearNameMap } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import { SharedDropDown } from "./SharedDropDown";

interface YearGroupDropDownProps {
  selectedYear: string | null;
  setSelectedYear: (value: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null) => void;
}

export const YearGroupDropDown = ({
  selectedYear,
  setSelectedYear,
  activeDropdown,
  setActiveDropdown,
}: YearGroupDropDownProps) => {
  const yearOptions = [
    ...Object.values(yearNameMap).filter(
      (year): year is string => year !== undefined,
    ),
    "Other",
  ];

  return (
    <SharedDropDown
      selectedValue={selectedYear}
      setSelectedValue={setSelectedYear}
      activeDropdown={activeDropdown}
      setActiveDropdown={setActiveDropdown}
      options={yearOptions}
      dropdownType="years"
      placeholder="Year group"
      customPlaceholder="Enter your custom year group"
    />
  );
};
