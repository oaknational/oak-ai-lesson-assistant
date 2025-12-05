import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakP,
  OakSmallSecondaryButton,
  OakTextInput,
} from "@oaknational/oak-components";

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
    <OakBox $position="relative" ref={dropdownRef}>
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
            <OakBox $pa="inner-padding-s">
              <OakTextInput
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                }}
                placeholder={customPlaceholder}
                style={{ width: "100%" }}
              />
              {errorMessage && (
                <OakP $color="text-error" $font="body-3" $mt="space-between-xs">
                  {errorMessage}
                </OakP>
              )}
              <OakFlex
                $gap={"space-between-xs"}
                $mt="space-between-s"
                $justifyContent="flex-end"
              >
                <OakSmallSecondaryButton
                  onClick={() => {
                    if (
                      dropdownType === "years" &&
                      !/^\d*$/.test(customValue)
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
                >
                  Confirm
                </OakSmallSecondaryButton>
                <OakSmallSecondaryButton
                  onClick={() => {
                    setCustomValue("");
                    setSelectedValue("Subject");
                    setActiveDropdown(null);
                  }}
                >
                  Cancel
                </OakSmallSecondaryButton>
              </OakFlex>
            </OakBox>
          )}
        </DropDownWrapper>
      )}
    </OakBox>
  );
};
