import { useState } from "react";

import { OakSmallSecondaryButton } from "@oaknational/oak-components";

import { useOutsideClick } from "@/components/hooks/useOutsideClick";

import { DropDownButton, DropDownItemButton, DropDownWrapper } from "./index";

interface SubjectsDropDownProps {
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null) => void;
}

export const SubjectsDropDown = ({
  selectedSubject,
  setSelectedSubject,
  activeDropdown,
  setActiveDropdown,
}: SubjectsDropDownProps) => {
  // @todo this should probs be dynamic and come from the backend
  const subjects = [
    "Science",
    "Spanish",
    "Maths",
    "German",
    "Creative Arts",
    "Physical Development",
    "Communication and Language",
    "Computing",
    "Independent Living",
    "Music",
    "Citizenship",
    "French",
    "Physical Education",
    "History",
    "Latin",
    "Religious Education",
    "Computing (Non-GCSE)",
    "Drama",
    "Biology",
    "Chemistry",
    "Numeracy",
    "English",
    "Literacy",
    "Geography",
    "Design & Technology",
    "Expressive Arts and Design",
    "Art & Design",
    "RSHE (PSHE)",
    "PSED",
    "Understanding the World",
    "English Spelling",
    "English Reading for Pleasure",
    "English Grammar",
    "Combined Science",
    "Physics",
    "Other",
  ];

  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useOutsideClick(() => {
    if (activeDropdown === "subjects") {
      setActiveDropdown(null);
    }
  });
  return (
    <div className="relative" ref={dropdownRef}>
      <DropDownButton
        onClick={() =>
          setActiveDropdown(activeDropdown === "subjects" ? null : "subjects")
        }
      >
        {selectedSubject || "Subject"}
      </DropDownButton>
      {activeDropdown === "subjects" && (
        <DropDownWrapper>
          {selectedSubject !== "Other" &&
            subjects.map((subject) => (
              <DropDownItemButton
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  if (subject !== "Other") {
                    setActiveDropdown(null);
                  }
                }}
              >
                {subject}
              </DropDownItemButton>
            ))}

          {selectedSubject === "Other" && (
            <div className="p-10">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="border-black-2 w-full rounded-md border-2 border-black p-7"
                placeholder="Enter your custom subject"
              />
              <OakSmallSecondaryButton
                onClick={() => {
                  setSelectedSubject(customValue);
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
