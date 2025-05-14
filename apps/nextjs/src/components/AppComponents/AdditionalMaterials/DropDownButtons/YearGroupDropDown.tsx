import { useState } from "react";

import { OakSmallSecondaryButton } from "@oaknational/oak-components";
import styled from "styled-components";

import { useOutsideClick } from "@/components/hooks/useOutsideClick";

import { DropDownButton, DropDownItemButton, DropDownWrapper } from "./index";

interface YearGroupDropDownProps {
  selectedYear: string;
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
  // @todo this should probs be dynamic and come from the backend
  const years = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
  const dropdownRef = useOutsideClick(() => {
    if (activeDropdown === "years") {
      setActiveDropdown(null);
    }
  });
  return (
    <div className="relative" ref={dropdownRef}>
      <DropDownButton
        onClick={() =>
          setActiveDropdown(activeDropdown === "years" ? null : "years")
        }
      >
        {selectedYear || "Year group"}
      </DropDownButton>
      {activeDropdown === "years" && (
        <DropDownWrapper>
          {years.map((year) => (
            <DropDownItemButton
              key={year}
              onClick={() => {
                setSelectedYear(year);
                setActiveDropdown(null);
              }}
            >
              {year}
            </DropDownItemButton>
          ))}
        </DropDownWrapper>
      )}
    </div>
  );
};
