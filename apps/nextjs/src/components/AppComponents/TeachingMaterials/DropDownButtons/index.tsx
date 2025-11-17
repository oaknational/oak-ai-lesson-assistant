import {
  OakBox,
  OakIcon,
  OakSecondaryButton,
  OakSpan,
} from "@oaknational/oak-components";
import styled from "styled-components";

import { SubjectsDropDown } from "./SubjectsDropDown";
import { YearGroupDropDown } from "./YearGroupDropDown";

const InnerButtonFlexSpan = styled(OakSpan)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const DropDownButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <OakSecondaryButton data-testid={"drop-down-button"} onClick={onClick}>
    <InnerButtonFlexSpan>
      <p>{children}</p>
      <OakBox className="scale-75">
        <OakIcon iconName="chevron-down" />
      </OakBox>
    </InnerButtonFlexSpan>
  </OakSecondaryButton>
);

export const DropDownWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <OakBox>
    <OakBox
      $position="absolute"
      $left="spacing-0"
      $top="spacing-16"
      $zIndex="modal-dialog"
      $mt="spacing-48"
      $height={["spacing-240", "spacing-360"]}
      $minWidth={["spacing-160", "spacing-360"]}
      $overflowY="scroll"
      $borderRadius="border-radius-m"
      $ba="border-solid-m"
      $background="white"
    >
      {children}
    </OakBox>
  </OakBox>
);

export const DropDownItemButton = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  text-align: left;
  &:hover {
    background-color: #f0f0f0;
  }
`;

export { SubjectsDropDown, YearGroupDropDown };
