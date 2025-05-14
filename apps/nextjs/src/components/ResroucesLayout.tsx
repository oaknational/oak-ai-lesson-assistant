import {
  OakBox,
  OakFlex,
  OakHeading,
  OakMaxWidth,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";

import { toSentenceCase } from "@/utils/toSentenceCase";

import HeaderManager from "./HeaderManager";

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  subTitle: string;
  step: number;
  docTypeName: string | null;
};
const ResourcesLayout = ({
  children,
  title,
  subTitle,
  step,
  docTypeName,
}: Readonly<LayoutProps>) => {
  return (
    <>
      <HeaderManager />
      <OakBox
        as="main"
        $inset="all-spacing-0"
        $position={"fixed"}
        $ph="inner-padding-m"
        $mt="space-between-xxl"
        $pt="inner-padding-xl7"
        $background={"lavender30"}
      >
        <OakMaxWidth
          $background="white"
          $borderRadius="border-radius-m"
          $position={"fixed"}
          $bottom={"all-spacing-0"}
          $top="all-spacing-17"
          $left="all-spacing-0"
          $right="all-spacing-0"
          $overflowY={"scroll"}
          $mb="space-between-xxxl"
          $pb="inner-padding-xl"
        >
          <OakBox $pa="inner-padding-xl4">
            <OakFlex
              $bb="border-solid-s"
              $borderColor="grey40"
              $pb="inner-padding-l"
              $mb="space-between-l"
              $flexDirection="column"
              $gap="all-spacing-4"
            >
              <OakBox
                $background="lemon50"
                $pa="inner-padding-s"
                $borderRadius="border-radius-circle"
                $width="fit-content"
              >
                <OakP $font="body-3">
                  Step {step} of 3{" "}
                  {docTypeName && `- ${toSentenceCase(docTypeName)}`}
                </OakP>
              </OakBox>
              <OakHeading as="h1" tag="h1" $font="heading-4">
                {title}
              </OakHeading>
              <OakP $font="body-1" $color="grey70">
                {subTitle}
              </OakP>
            </OakFlex>
            {children}
          </OakBox>
        </OakMaxWidth>
      </OakBox>
    </>
  );
};

export default ResourcesLayout;
