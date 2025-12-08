import {
  OakBox,
  OakMaxWidth,
  type OakUiRoleToken,
} from "@oaknational/oak-components";

type MainProps = {
  children: React.ReactNode;
  backgroundColor?: OakUiRoleToken;
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
      $ph="inner-padding-m"
      $pt="inner-padding-xl7"
      $background={backgroundColor ?? "transparent"}
      $overflowX={["hidden", "hidden", "visible"]}
    >
      {defaultMaxWidth ? (
        <OakMaxWidth $mt="space-between-xxl">{children}</OakMaxWidth>
      ) : (
        children
      )}
    </OakBox>
  );
};

export default Main;
