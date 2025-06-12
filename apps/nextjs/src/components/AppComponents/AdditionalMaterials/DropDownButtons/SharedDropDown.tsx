import { useState } from "react";

import { OakSmallSecondaryButton } from "@oaknational/oak-components";

import { useOutsideClick } from "@/components/hooks/useOutsideClick";

import { DropDownButton, DropDownItemButton, DropDownWrapper } from "./index";

interface SharedDropDownProps {
  selectedValue: string | null;
  setSelectedValue: (value: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null) => void;
  options: string[];
  dropdownType: string;
  placeholder: string;
  customPlaceholder: string;
}

export const SharedDropDown = ({
  selectedValue,
  setSelectedValue,
  activeDropdown,
  setActiveDropdown,
  options,
  dropdownType,
  placeholder,
  customPlaceholder,
}: SharedDropDownProps) => {
  const [customValue, setCustomValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dropdownRef = useOutsideClick(() => {
    if (activeDropdown === dropdownType) {
      setActiveDropdown(null);
    }
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <DropDownButton
        onClick={() =>
          setActiveDropdown(
            activeDropdown === dropdownType ? null : dropdownType,
          )
        }
      >
        {selectedValue ?? placeholder}
      </DropDownButton>
      {activeDropdown === dropdownType && (
        <DropDownWrapper>
          {selectedValue !== "Other" &&
            options.map((option) => (
              <DropDownItemButton
                key={option}
                onClick={() => {
                  setSelectedValue(option);
                  if (option === "Other") {
                    setActiveDropdown(dropdownType);
                  } else {
                    setActiveDropdown(null);
                  }
                }}
              >
                {option}
              </DropDownItemButton>
            ))}

          {selectedValue === "Other" && (
            <div className="p-10">
              <input
                type="text"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                }}
                className="border-black-2 w-full rounded-md border-2 border-black p-7"
                placeholder={customPlaceholder}
              />
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <OakSmallSecondaryButton
                onClick={() => {
                  if (
                    dropdownType === "years" &&
                    !/^[0-9]*$/.test(customValue)
                  ) {
                    setErrorMessage("Please enter a valid number.");
                    return;
                  }
                  setErrorMessage("");
                  setSelectedValue(
                    dropdownType === "years"
                      ? `Year ${customValue}`
                      : customValue,
                  );
                  setActiveDropdown(null);
                }}
                $mt="space-between-s"
              >
                Confirm
              </OakSmallSecondaryButton>
            </div>
          )}
        </DropDownWrapper>
      )}
    </div>
  );
};
