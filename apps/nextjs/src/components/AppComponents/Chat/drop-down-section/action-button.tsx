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
}: {
  children: React.ReactNode;
  onClick: () => void;
  tooltip: string;
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

  return (
    <OakTooltip
      tooltip={tooltip}
      tooltipPosition="top-left"
      isOpen={showTooltip}
      $background="black"
      $color="white"
    >
      <OakBox onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
