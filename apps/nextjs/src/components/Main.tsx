import {
  OakBox,
  type OakColorToken,
  OakMaxWidth,
} from "@oaknational/oak-components";

type MainProps = {
  children: React.ReactNode;
  backgroundColor?: OakColorToken;
  defaultMaxWidth?: boolean;
};

const Main = ({
  children,
  defaultMaxWidth,
  backgroundColor,
}: Readonly<MainProps>) => {
  return (
    <OakBox
      as="main"
      $position={"relative"}
      $ph="spacing-16"
      $pt="spacing-72"
      $background={backgroundColor ?? "transparent"}
      $overflowX={["hidden", "hidden", "visible"]}
    >
      {defaultMaxWidth ? (
        <OakMaxWidth $mt="spacing-72">{children}</OakMaxWidth>
      ) : (
        children
      )}
    </OakBox>
  );
};

export default Main;
