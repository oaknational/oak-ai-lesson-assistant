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
      $ph="inner-padding-m"
      $mt="space-between-xxl"
      $pt="inner-padding-xl7"
      $background={backgroundColor ?? "transparent"}
    >
      {defaultMaxWidth ? <OakMaxWidth>{children}</OakMaxWidth> : children}
    </OakBox>
  );
};

export default Main;
