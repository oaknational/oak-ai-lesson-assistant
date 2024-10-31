import { useCallback, useState } from "react";

import {
  OakBox,
  OakSmallSecondaryButton,
  OakTooltip,
} from "@oaknational/oak-components";
import styled from "styled-components";

const ActionButton = ({
  children,
  onClick,
  tooltip,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, [setShowTooltip]);

  const handleMouseEnter = useCallback(() => {
    const showTooltipAsync = async () => {
      await waitThenExecute(0).then(() => {
        setShowTooltip(true);
      });
    };
    void showTooltipAsync();
  }, [setShowTooltip]);

  const buttonContent = (
    <OakBox onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <OakSmallSecondaryWithOpaqueBorder onClick={onClick} disabled={disabled}>
        {children}
      </OakSmallSecondaryWithOpaqueBorder>
    </OakBox>
  );

  return tooltip ? (
    <OakTooltip
      tooltip={tooltip}
      tooltipPosition="top-left"
      isOpen={showTooltip}
      $background="black"
      $color="white"
    >
      {buttonContent}
    </OakTooltip>
  ) : (
    buttonContent
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
