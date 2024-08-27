import { OakBox, OakMaxWidth } from "@oaknational/oak-components";

type MainProps = {
  children: React.ReactNode;
  bg?: string;
};

const Main = ({ children }: Readonly<MainProps>) => {
  return (
    <OakBox
      as="main"
      $position={"relative"}
      $ph="inner-padding-m"
      $mt="space-between-xxl"
      $pt="inner-padding-xl7"
    >
      <OakMaxWidth>{children}</OakMaxWidth>
    </OakBox>
  );
};

export default Main;
