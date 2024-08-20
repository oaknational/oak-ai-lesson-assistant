import { Children, useState } from "react";

import {
  OakBox,
  OakSpan,
  OakTertiaryButton,
  OakTooltip,
} from "@oaknational/oak-components";

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

  return (
    <OakTooltip
      tooltip={tooltip}
      tooltipPosition="top-left"
      isOpen={showTooltip}
      $background="black"
      $color="white"
    >
      <div
        onMouseEnter={async () => {
          await waitThenExecute(200).then(() => {
            setShowTooltip(true);
          });
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
      >
        <OakTertiaryButton onClick={onClick}>
          <OakSpan
            $borderColor="border-neutral-lighter"
            $ba="border-solid-m"
            $ph="inner-padding-xs"
            $pv="inner-padding-ssx"
            $borderRadius="border-radius-s"
          >
            {children}
          </OakSpan>
        </OakTertiaryButton>
      </div>
    </OakTooltip>
  );
};

async function waitThenExecute(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default ActionButton;
