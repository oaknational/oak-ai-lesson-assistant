import React from "react";

import {
  OakFlex,
  type OakIconName,
  OakPrimaryButton,
  OakPrimaryInvertedButton,
} from "@oaknational/oak-components";

type SharedNavigationButtonsProps = {
  backLabel: string;
  nextLabel: string;
  onNextClick: () => void;
  onBackClick: () => void;
  mobileBackLabel?: string;
  mobileNextLabel?: string;
  backHref?: string;
};

const BackButton: React.FC<{
  backHref?: string;
  onBackClick: () => void;
  label: string;
  iconName: OakIconName;
}> = ({ backHref, onBackClick, label, iconName }) =>
  backHref ? (
    <OakPrimaryInvertedButton element="a" href={backHref} iconName={iconName}>
      {label}
    </OakPrimaryInvertedButton>
  ) : (
    <OakPrimaryInvertedButton onClick={onBackClick} iconName={iconName}>
      {label}
    </OakPrimaryInvertedButton>
  );

const MobileNavigationButtons: React.FC<{
  backHref?: string;
  onBackClick: () => void;
  mobileBackLabel?: string;
  mobileNextLabel?: string;
  onNextClick: () => void;
}> = ({
  backHref,
  onBackClick,
  mobileBackLabel,
  mobileNextLabel,
  onNextClick,
}) => (
  <OakFlex
    $justifyContent="space-between"
    $width="100%"
    $display={["flex", "none"]}
  >
    <BackButton
      backHref={backHref}
      onBackClick={onBackClick}
      label={mobileBackLabel ?? "Back"}
      iconName="chevron-left"
    />
    <OakPrimaryButton
      onClick={onNextClick}
      iconName="arrow-right"
      isTrailingIcon={true}
      data-testid="mobile-next-button"
    >
      {mobileNextLabel ?? "Next"}
    </OakPrimaryButton>
  </OakFlex>
);

const SharedNavigationButtons: React.FC<SharedNavigationButtonsProps> = ({
  backLabel,
  nextLabel,
  backHref,
  onNextClick,
  onBackClick,
  mobileBackLabel,
  mobileNextLabel,
}) => {
  return (
    <>
      <OakFlex
        $justifyContent="space-between"
        $width="100%"
        $display={["none", "flex"]}
      >
        <BackButton
          backHref={backHref}
          onBackClick={onBackClick}
          label={backLabel}
          iconName="chevron-left"
        />
        <OakPrimaryButton
          onClick={onNextClick}
          iconName="arrow-right"
          isTrailingIcon={true}
        >
          {nextLabel}
        </OakPrimaryButton>
      </OakFlex>
      <MobileNavigationButtons
        backHref={backHref}
        onBackClick={onBackClick}
        mobileBackLabel={mobileBackLabel}
        mobileNextLabel={mobileNextLabel}
        onNextClick={onNextClick}
      />
    </>
  );
};

export default SharedNavigationButtons;
