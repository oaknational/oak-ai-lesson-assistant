import { useState } from "react";

import {
  OakBox,
  OakSmallSecondaryButton,
  OakTooltip,
} from "@oaknational/oak-components";
import styled from "styled-components";

export type ActionButtonProps = Readonly<{
  children: React.ReactNode;
  onClick: () => void;
  tooltip: string;
}>;
const ActionButton = ({ children, onClick, tooltip }: ActionButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <OakTooltip
      tooltip={tooltip}
      tooltipPosition="top-left"
      isOpen={showTooltip}
      $background="black"
      $color="white"
    >
      <OakBox
        onMouseEnter={() => {
          void waitThenExecute(0).then(() => {
            setShowTooltip(true);
          });
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
      >
        <OakSmallSecondaryWithOpaqueBorder onClick={onClick}>
          {children}
        </OakSmallSecondaryWithOpaqueBorder>
      </OakBox>
    </OakTooltip>
  );
};

const OakSmallSecondaryWithOpaqueBorder = styled(OakSmallSecondaryButton)`
  button {
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

async function waitThenExecute(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default ActionButton;
