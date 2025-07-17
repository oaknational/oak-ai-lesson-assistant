import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { SharedDropDown } from "./SharedDropDown";

const meta = {
  title: "Components/AdditionalMaterials/DropDownButtons/SharedDropDown",
  component: SharedDropDown,
  tags: ["autodocs"],
  parameters: {
    ...chromaticParams(["desktop"]),
    layout: "centered",
  },
} satisfies Meta<typeof SharedDropDown>;

export default meta;
type Story = StoryObj<typeof InteractiveWrapper>;

const InteractiveWrapper = ({
  selectedValue: initialSelectedValue,
  options,
  dropdownType,
  placeholder,
  customPlaceholder,
}: {
  selectedValue: string | null;
  options: string[];
  dropdownType: string;
  placeholder: string;
  customPlaceholder: string;
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    initialSelectedValue,
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "300px", padding: "20px" }}>
      <SharedDropDown
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        options={options}
        dropdownType={dropdownType}
        placeholder={placeholder}
        customPlaceholder={customPlaceholder}
      />
    </div>
  );
};

export const Default: Story = {
  args: {
    selectedValue: null,
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Option 5",
      "Option 6",
      "Option 7",
      "Option 8",
      "Option 9",
      "Option 10",
      "Other",
    ],
    dropdownType: "example",
    placeholder: "Select an option",
    customPlaceholder: "Enter custom value",
  },
  render: (args) => <InteractiveWrapper {...args} />,
};

export const WithSelectedValue: Story = {
  args: {
    selectedValue: "Option 2",
    options: [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Option 5",
      "Option 6",
      "Option 7",
      "Option 8",
      "Option 9",
      "Option 10",
      "Other",
    ],
    dropdownType: "example",
    placeholder: "Select an option",
    customPlaceholder: "Enter custom value",
  },
  render: (args) => <InteractiveWrapper {...args} />,
};
